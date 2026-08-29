import { useState, useCallback } from 'react';

export type SortOption = 'name_asc' | 'name_desc' | 'date_desc' | 'date_asc';

export function useSort(storageKey: string, defaultSort: SortOption = 'name_asc') {
  const [sort, setSortState] = useState<SortOption>(() => {
    const stored = localStorage.getItem(storageKey);
    return (stored as SortOption) || defaultSort;
  });

  const setSort = useCallback((option: SortOption) => {
    setSortState(option);
    localStorage.setItem(storageKey, option);
  }, [storageKey]);

  return [sort, setSort] as const;
}
