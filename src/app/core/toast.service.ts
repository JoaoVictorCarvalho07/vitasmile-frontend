import { Injectable, signal } from '@angular/core';

export type TipoToast = 'erro' | 'info' | 'sucesso';

export interface Toast {
  id: number;
  texto: string;
  tipo: TipoToast;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private contador = 0;
  readonly toasts = signal<Toast[]>([]);

  erro(texto: string): void {
    this.mostrar(texto, 'erro');
  }

  info(texto: string): void {
    this.mostrar(texto, 'info');
  }

  sucesso(texto: string): void {
    this.mostrar(texto, 'sucesso');
  }

  remover(id: number): void {
    this.toasts.update((lista) => lista.filter((t) => t.id !== id));
  }

  private mostrar(texto: string, tipo: TipoToast): void {
    if (this.toasts().some((t) => t.texto === texto)) {
      return;
    }
    const id = ++this.contador;
    this.toasts.update((lista) => [...lista, { id, texto, tipo }]);
    setTimeout(() => this.remover(id), 5000);
  }
}
