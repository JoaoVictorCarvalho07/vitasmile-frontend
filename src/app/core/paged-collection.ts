import { computed, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable, of } from 'rxjs';
import { catchError, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { Page, PageQuery, emptyPage } from '../models/page.model';

export class PagedCollection<T> {
  private readonly query = signal<PageQuery>({ page: 0, size: 10, sort: undefined });
  private readonly reloadTick = signal(0);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly page = signal<Page<T> | null>(null);

  readonly items = computed(() => this.page()?.content ?? []);
  readonly totalElements = computed(() => this.page()?.totalElements ?? 0);
  readonly totalPages = computed(() => this.page()?.totalPages ?? 0);
  readonly pageIndex = computed(() => this.query().page);
  readonly pageSize = computed(() => this.query().size);
  readonly isFirst = computed(() => this.pageIndex() <= 0);
  readonly isLast = computed(() => this.pageIndex() >= this.totalPages() - 1);

  constructor(private readonly fetch: (query: PageQuery) => Observable<Page<T>>) {
    const trigger = computed(() => ({ ...this.query(), tick: this.reloadTick() }));

    toObservable(trigger)
      .pipe(
        distinctUntilChanged(
          (a, b) => a.page === b.page && a.size === b.size && a.sort === b.sort && a.tick === b.tick,
        ),
        tap(() => {
          this.loading.set(true);
          this.error.set(null);
        }),
        switchMap((q) =>
          this.fetch(q).pipe(
            catchError(() => {
              this.error.set('Erro ao carregar dados.');
              return of(emptyPage<T>(q));
            }),
          ),
        ),
        tap(() => this.loading.set(false)),
      )
      .subscribe((result) => this.page.set(result));
  }

  setPage(index: number): void {
    this.query.update((q) => ({ ...q, page: index }));
  }

  setSize(size: number): void {
    this.query.update((q) => ({ ...q, page: 0, size }));
  }

  setSort(sort?: string): void {
    this.query.update((q) => ({ ...q, page: 0, sort }));
  }

  next(): void {
    if (!this.isLast()) {
      this.setPage(this.pageIndex() + 1);
    }
  }

  prev(): void {
    if (!this.isFirst()) {
      this.setPage(this.pageIndex() - 1);
    }
  }

  reload(): void {
    this.reloadTick.update((t) => t + 1);
  }
}
