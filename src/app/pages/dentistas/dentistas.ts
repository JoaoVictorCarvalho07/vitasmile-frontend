import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { DentistaService } from '../../services/dentista.service';
import { Dentista } from '../../models/dentista.model';

@Component({
  selector: 'app-dentistas',
  imports: [FormsModule, DatePipe],
  templateUrl: './dentistas.html',
  styleUrl: './dentistas.scss',
})
export class DentistasComponent implements OnInit {
  private dentistaService = inject(DentistaService);

  dentistas: Dentista[] = [];
  busca = '';
  toggling = new Set<number>();

  ngOnInit(): void {
    this.dentistaService.getAll().subscribe({ next: (d) => (this.dentistas = d) });
  }

  get dentistasFiltrados(): Dentista[] {
    const termo = this.busca.toLowerCase();
    if (!termo) return this.dentistas;
    return this.dentistas.filter(
      (d) => d.nome.toLowerCase().includes(termo) || d.cro.toLowerCase().includes(termo),
    );
  }

  toggleAtivo(d: Dentista): void {
    if (this.toggling.has(d.id)) return;
    this.toggling.add(d.id);
    this.dentistaService.update(d.id, { ...d, ativo: !d.ativo }).subscribe({
      next: (atualizado) => {
        this.dentistas = this.dentistas.map((x) => (x.id === atualizado.id ? atualizado : x));
        this.toggling.delete(d.id);
      },
      error: () => this.toggling.delete(d.id),
    });
  }
}
