# VitaSmile — Documentação do Frontend

SPA em **Angular 21** (standalone components, rotas lazy, guards e interceptor funcionais). Este documento é um "estudável": explica a estratégia de estado (**Signals vs RxJS**), a lógica dos **services**, e percorre **componente por componente** dizendo o que cada um decide.

---

## 1. Visão geral da arquitetura

- **Standalone components** (sem NgModules), rotas com `loadComponent` (lazy).
- **Guards funcionais** (`authGuard`, `roleGuard`) e **interceptor funcional** (`jwtInterceptor`).
- **Estado com Signals**; **RxJS** no que é assíncrono (HTTP, cache, cancelamento).
- **SCSS com variáveis CSS + BEM**, sem Angular Material.
- Configuração de API por ambiente (`environment.ts` / `environment.prod.ts`).

---

## 2. A decisão central: Signals vs RxJS

A regra que guia o projeto inteiro:

- **Signals = estado síncrono e derivações.** Servem para estado de UI (flags de modal, `loading`, `erro`, `busca`, `editando`), valores derivados (`computed`: listas filtradas, totais, ticket médio) e como **gatilhos reativos** (`reload`, `query`). O template lê signals direto → change detection fina.
- **RxJS = composição assíncrona.** É inevitável no HTTP (`HttpClient` devolve `Observable`) e é usado **de propósito** para:
  - **Cache** — `shareReplay({ bufferSize: 1, refCount: false })` memoiza o `getAll()` (navegar de volta não refaz a requisição); `invalidateAll()` limpa.
  - **Cancelamento + dedupe** — `switchMap` (cancela requisição em voo quando o filtro/reload muda) e `distinctUntilChanged` (pula busca redundante), dentro do `PagedCollection`.
  - **Resiliência** — `catchError` (volta página vazia; o interceptor engole erro de conexão com `EMPTY`).
  - **Ciclo de vida** — `takeUntilDestroyed()` cancela inscrições one-shot automaticamente.
- **A ponte (`@angular/core/rxjs-interop`):**
  - `toObservable(signal)` → transforma um gatilho (`reload`/`query`) em stream para o `switchMap`.
  - `toSignal(observable)` → transforma o resultado de volta num signal que o template consome (com `initialValue`).

**Por que não só Signal no cache?** Um signal sozinho não tem `shareReplay` (multicast + replay para quem chega depois) nem dedupe de cargas concorrentes. Por isso o cache é um `Observable` memoizado e só vira signal na borda do componente.

Existem **três estilos de consumo de lista** no projeto:

| Estilo | Quando | Componentes |
|---|---|---|
| **Declarativo (`toSignal` + `reload` + `switchMap(getAll)`)** | listas simples "carrega tudo e mostra" | dashboard, especialidades, procedimentos |
| **`PagedCollection`** | paginação server-side reativa | pacientes, dentistas, usuários, consultas |
| **Imperativo (`subscribe` + signals)** | sob demanda / multi-filtro / one-shot | relatórios, login |

---

## 3. Camada de services

Todos são singletons (`providedIn: 'root'`) → o cache vive enquanto a aba existe.

- **`getAll()` com cache** (`auth`, `consulta`, `paciente`, `dentista`, `usuario`, `especialidade`, `procedimento`):
  ```ts
  getAll() {
    return (this.allCache$ ??= this.getPage({page:0,size:1000}).pipe(
      map(p => p.content ?? []),
      shareReplay({ bufferSize: 1, refCount: false }),
    ));
  }
  invalidateAll() { this.allCache$ = undefined; }
  ```
  Memoiza a primeira chamada e replica para os próximos; `refCount:false` mantém o cache mesmo sem assinantes (sobrevive à navegação).
- **`lista = new PagedCollection<T>(query => this.getPage(query))`** (`consulta`, `paciente`, `dentista`, `usuario`): paginação server-side reativa.
- **Mutações** (`create`/`update`/`setAtivo`/`cancelar`/`finalizar`/`editar`): `http.post/put` puro; o componente faz `subscribe`, depois `invalidateAll()` + `lista.reload()` para refletir.
- **`relatorio.service`**: sem cache — relatórios são sob demanda, com muitos filtros; cada chamada monta `HttpParams`.
- **`auth.service`**: guarda token/perfil/nome no **`localStorage`** (compartilhado entre abas do mesmo navegador) e expõe `isAdmin/isDentista/isPaciente`.

### `PagedCollection<T>` (o motor de paginação)
`core/paged-collection.ts` junta Signals e RxJS num só lugar:
- Estado em signals: `query` (page/size/sort), `reloadTick`, `loading`, `error`, `page`.
- Derivados (`computed`): `items`, `totalElements`, `totalPages`, `pageIndex`, `pageSize`, `isFirst`, `isLast`.
- Pipeline: `toObservable(trigger)` → `distinctUntilChanged` → `tap(loading=true)` → `switchMap(fetch)` → `catchError(página vazia)` → `tap(loading=false)` → `page.set(...)`.
- Ações: `setPage/setSize/setSort/next/prev/reload`.

O componente só consome signals (`lista.items()`, `lista.loading()`, `lista.isLast()`…) e dispara ações — sem `subscribe` manual.

---

## 4. Componente por componente

### Dashboard (`pages/dashboard`)
- **Papel:** cartões-resumo (consultas hoje, pendentes, pendentes na semana, pacientes ativos).
- **Signal/RxJS:** estilo **declarativo** — `reload` (signal) → `toObservable` → `switchMap(consultaService.getAll())` → `toSignal` (`todasConsultas`). Os cartões são `computed` em cima desse signal (`consultasHoje`, `totalHoje`, `totalPendentes`, `totalPendentesSemana`). `totalPacientes` lê `pacienteService.lista.totalElements()` (signal do PagedCollection).
- **Services:** `consulta.getAll()` (cache) e `paciente.lista`. `recarregar()` faz `invalidateAll()` + `lista.reload()` + incrementa o `reload`.

### Consultas (`pages/consultas`)
- **Papel:** listar/criar/editar/cancelar/finalizar; tela "seca" para o paciente.
- **Signal/RxJS:** **PagedCollection** (`consultaService.lista`) para a tabela. Os combos (pacientes/dentistas/procedimentos) são carregados no construtor via `getAll().pipe(takeUntilDestroyed()).subscribe(...)`. Filtros e o formulário do modal são campos comuns; `consultasFiltradas` é um *getter* que filtra `lista.items()`. Booleans de perfil (`isPaciente/isDentista/isAdmin`).
- **Services:** `consulta.lista` + `create/editar/cancelar/finalizar`; após mutação, `invalidateAll()` + `lista.reload()`. Datas: o modal usa **data + hora início/fim** e remonta `dataInicio`/`dataFim` no envio.

### Pacientes (`pages/pacientes`)
- **Signal/RxJS:** **PagedCollection** (`lista`) + `computed` `pacientesFiltrados` (busca client-side) + signals (`busca`, modal, `editando`, `meusPacientesIds`). Dentista carrega `meusIds()` no construtor com `takeUntilDestroyed`.
- **Lógica de perfil:** `podeEditar(id)` = admin **ou** id ∈ pacientes do dentista logado.
- **Services:** `paciente.lista` + `create/update/meusIds`.

### Dentistas (`pages/dentistas`)
- **Signal/RxJS:** **PagedCollection** + `computed` `dentistasFiltrados` + signals (`busca`, `toggling` = Set de ids em processamento, para evitar clique duplo). `setAtivo` é `subscribe` imperativo → `lista.reload()`.
- **Services:** `dentista.lista` + `setAtivo`.

### Usuários (`pages/usuarios`) — ADMIN
- **Signal/RxJS:** **PagedCollection** + `computed` `usuariosFiltrados` + signals (`busca`, `toggling`, modal, `editando`). CRUD via `subscribe` (create/update/setAtivo) → `lista.reload()`.
- **Services:** `usuario.lista` + `create/update/setAtivo`.

### Especialidades (`pages/especialidades`) — ADMIN
- **Signal/RxJS:** estilo **declarativo** (`reload` → `switchMap(getAll())` → `toSignal`) + signals de modal. `create` imperativo → `invalidateAll()` + `reload`.
- **Services:** `especialidade.getAll/create`.

### Procedimentos (`pages/procedimentos`)
- **Signal/RxJS:** **declarativo** para a lista (`reload` + `switchMap(getAll())` → `toSignal`); `especialidades` via `toSignal(getAll())` (sem reload, só para o combo do modal). CRUD só para admin.
- **Services:** `procedimento.getAll/create`, `especialidade.getAll`.

### Relatórios (`pages/relatorios`) — ADMIN
- **Signal/RxJS:** estilo **imperativo** — todo o estado em signals (`resumo`, `consultas`, `dentistasDoProcedimento`, `pageIndex`, `pageSize`, `carregando`, `erro`, `buscou`, modal). Os combos de filtro são carregados no construtor (`getAll()` + `takeUntilDestroyed`). A busca dispara `subscribe`s sob demanda; paginação manual via signals (não usa PagedCollection porque a query tem muitos filtros e é acionada por botão).
- **Drill-down:** ao clicar num dentista, abre modal e busca `procedimentosDoDentista`.
- **Services:** `relatorio.*` + os 5 services de combo.

### Contato (`pages/contato`)
- **Signal/RxJS:** nenhum assíncrono — formulário simples; ao enviar, monta o texto e abre o **WhatsApp** (`wa.me`). Pré-preenche o nome com `auth.getNome()`.

### Landing (`pages/landing`)
- **Signal/RxJS:** estática, sem stream. `entrar()` navega para `/dashboard` (se logado) ou `/login`; CTA de WhatsApp.

### Login (`pages/login`)
- **Signal/RxJS:** **imperativo** one-shot — campos comuns (`loading`, `error`); `authService.login().subscribe()` → on success `router.navigate(['/dashboard'])`.

### Layout (`layout/main-layout`, `layout/sidebar`)
- **main-layout:** casca autenticada (`<router-outlet>` + `<app-sidebar>`).
- **sidebar:** itens do menu via `@if` com getters de perfil (`isAdmin/isDentista/isPaciente`); `logout()` → `auth.logout()` + navega para login.

### Toast (`core/toast.service` + `core/toast`)
- **Signal/RxJS:** **só Signals** — `toasts` (signal) + auto-dismiss (`setTimeout`) + dedupe por texto. Sem RxJS. Montado uma vez no `app-root`, aparece em qualquer tela.

### Interceptor (`core/jwt.interceptor`)
- **Signal/RxJS:** **RxJS** (`catchError`). Anexa o `Bearer` token; em `status === 0` mostra toast e encerra com `EMPTY`; em 401 com `X-Token-Expired` faz logout.

---

## 5. Roteamento e guards

- `/` → **landing** (pública). `/login` → login. Demais rotas ficam sob a casca autenticada (`MainLayout`, `authGuard`).
- **`authGuard`**: sem token → redireciona para `/login`.
- **`roleGuard(perfis)`**: sem token → `/login`; perfil sem permissão → `/consultas`. Aplicado em dashboard/pacientes (ADMIN+DENTISTA) e dentistas/especialidades/relatorios/usuarios (ADMIN).
- Redirecionamento pós-login: o login vai para `/dashboard`; o guard reencaminha o paciente para `/consultas`.

---

## 6. Guia de navegação por perfil

- **ADMIN:** tudo — Dashboard, Consultas, Pacientes, Dentistas, Especialidades, Procedimentos, Relatórios, Usuários, Contato.
- **DENTISTA:** Dashboard (consultas de hoje + pendentes da semana), Consultas (as suas; cria já como dentista), Pacientes (edita só os atribuídos), Procedimentos (leitura), Contato.
- **PACIENTE:** Consultas (lista das próprias, pode cancelar agendadas), Procedimentos (leitura, com aviso de preço), Contato.

---

## 7. Decisões fora do escopo original (front)

- **Perfil PACIENTE** com experiência própria (lista seca, cancelar a própria, contato).
- **Cache nos services** (`shareReplay`) + **`PagedCollection`** reutilizável — performance e menos requisições.
- **Toast** próprio (sem biblioteca) para erro de conexão.
- **Landing page** pública da clínica (não pedida).
- **Página de Contato** integrada ao WhatsApp.
- **Botão "Atualizar"** por tela (recarrega só o conteúdo daquela tela).
- **Responsividade** (grid/flex; layouts viram coluna no mobile).
- **Build/deploy** com Docker + Vercel (`vercel.json`, `environment.prod`) — ver `DOCKER.md`.

**Não implementados (extras opcionais):** gráficos (Chart.js), upload de arquivos, tempo real (WebSocket), tema claro/escuro, login social.

---

## 8. Como executar

**Pré-requisitos:** Node + npm.

```bash
npm install
npm start          # ng serve → http://localhost:4200
```

- Em dev usa `environment.ts` (`apiUrl = http://localhost:8080`) — suba o backend antes.
- Build de produção: `npm run build` (usa `environment.prod.ts`; a URL da API é injetada no Docker/Vercel — ver `DOCKER.md`).
- Logins de teste: ver `../backend/LOGINS.md`.
