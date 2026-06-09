import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { DentistaService } from '../../services/dentista.service';
import { Dentista } from '../../models/dentista.model';
import { PAGE_SIZE_OPTIONS } from '../../models/page.model';

@Component({
  selector: 'app-dentistas',
  imports: [FormsModule, DatePipe],
  templateUrl: './dentistas.html',
  styleUrl: './dentistas.scss',
})
export class DentistasComponent {
  private dentistaService = inject(DentistaService);

  readonly lista = this.dentistaService.lista;
  readonly tamanhos = PAGE_SIZE_OPTIONS;

  busca = signal('');
  toggling = signal<ReadonlySet<number>>(new Set());

  readonly dentistasFiltrados = computed(() => {
    const termo = this.busca().toLowerCase();
    const itens = this.lista.items();
    if (!termo) return itens;
    return itens.filter(
      (d) => d.nome.toLowerCase().includes(termo) || d.cro.toLowerCase().includes(termo),
    );
  });

  mudarTamanho(valor: string): void {
    this.lista.setSize(Number(valor));
  }

  toggleAtivo(d: Dentista): void {
    if (this.toggling().has(d.id)) return;
    this.toggling.update((s) => new Set(s).add(d.id));

    this.dentistaService.update(d.id, { ...d, ativo: !d.ativo }).subscribe({
      next: () => {
        this.lista.reload();
        this.removerToggling(d.id);
      },
      error: () => this.removerToggling(d.id),
    });
  }

  private removerToggling(id: number): void {
    this.toggling.update((s) => {
      const proximo = new Set(s);
      proximo.delete(id);
      return proximo;
    });
  }
}
