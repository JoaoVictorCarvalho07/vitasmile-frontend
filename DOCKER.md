# Docker — Frontend (VitaSmile)

Este serviço (Angular compilado + nginx) faz parte do `docker-compose.yml` que fica na **raiz do monorepo** (uma pasta acima desta), junto com o backend e o MySQL.

## O docker-compose (visão geral)

O compose sobe três serviços na mesma rede:

- **db** — MySQL 8 (com volume pra persistir os dados).
- **backend** — Spring Boot, escutando na porta 8080.
- **frontend** — esta aplicação: o Angular é compilado e servido por nginx.

## A URL da API (build-arg)

O Angular roda no **navegador**, então ele precisa saber a URL pública do backend **na hora do build** (não dá pra decidir isso em runtime sem complicar). Resolvemos assim:

1. `src/environments/environment.prod.ts` tem `apiUrl: '__API_URL__'` — um placeholder.
2. O `Dockerfile` recebe um build-arg `API_URL` e, **antes** do `ng build`, troca o `__API_URL__` por esse valor (com `sed`).
3. O `ng build` de produção usa o `environment.prod.ts` no lugar do `environment.ts` (configurado em `angular.json` → `fileReplacements`).

No compose o valor vem de `API_URL` no `.env` da raiz. No Railway, você cria uma variável `API_URL` no serviço do front — o Railway entrega as variáveis como build-arg quando o `Dockerfile` declara `ARG`.

> **Importante:** o placeholder só é trocado **dentro do Docker**. Para o dia a dia use `ng serve` (que usa `environment.ts` = `http://localhost:8080`), não o build de produção.

## nginx

A imagem final serve os arquivos estáticos com nginx. O `nginx.conf` é um template:

- `listen ${PORT}` — a porta vem por variável de ambiente (o Railway injeta; no compose é `80`).
- `try_files $uri $uri/ /index.html` — faz o roteamento do Angular funcionar (dar F5 numa rota interna não retorna 404).

## Como rodar

**Tudo junto (recomendado)** — na raiz do monorepo:

```bash
cp .env.example .env
docker compose up --build
```

Front em `http://localhost:4200`.

**Só o front (imagem isolada)** — na raiz:

```bash
docker build --build-arg API_URL=http://localhost:8080 -t vitasmile-frontend ./vitasmile-frontend
docker run -p 4200:80 vitasmile-frontend
```

**Sem Docker (dev)** — `ng serve` (usa `http://localhost:8080`).
