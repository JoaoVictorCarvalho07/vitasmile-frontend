export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface PageQuery {
  page: number;
  size: number;
  sort?: string;
}

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export function emptyPage<T>(query: PageQuery): Page<T> {
  return {
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: query.page,
    size: query.size,
    first: true,
    last: true,
  };
}
