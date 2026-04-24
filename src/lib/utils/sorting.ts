import { SortOption } from '../../hooks/useSort';

export function sortItems<T extends { title?: string; name?: string; date_modified?: number }>(
  items: T[],
  sortOption: SortOption
): T[] {
  const sorted = [...items];
  
  const getDisplayName = (item: T) => (item.title || item.name || '').toLowerCase();

  switch (sortOption) {
    case 'name_asc':
      sorted.sort((a, b) => getDisplayName(a).localeCompare(getDisplayName(b), undefined, { sensitivity: 'base' }));
      break;
    case 'name_desc':
      sorted.sort((a, b) => getDisplayName(b).localeCompare(getDisplayName(a), undefined, { sensitivity: 'base' }));
      break;
    case 'date_desc':
      sorted.sort((a, b) => (b.date_modified || 0) - (a.date_modified || 0));
      break;
    case 'date_asc':
      sorted.sort((a, b) => (a.date_modified || 0) - (b.date_modified || 0));
      break;
  }
  return sorted;
}
