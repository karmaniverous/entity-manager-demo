export interface SearchResult<T> {
  count: number;
  items: T[];
  pageKey?: string;
}
