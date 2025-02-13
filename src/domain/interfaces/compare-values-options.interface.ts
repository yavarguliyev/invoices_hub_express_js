import { SortOrder } from 'core/types/decorator.types';

export interface CompareValuesOptions<T> {
  a: T;
  b: T;
  key: keyof T;
  sortOrder: SortOrder;
};
