import type { Recipe } from '../types';

export interface CategoryDef {
  id: string;
  label: string;
  match: (labels: string[]) => boolean;
}

const has = (labels: string[], value: string) => labels.includes(value);
const hasAny = (labels: string[], values: string[]) => values.some((v) => labels.includes(v));

// A deliberately short, curated list of top-level categories. Not every
// label recipes carry needs to show up as a filter chip.
export const CATEGORY_DEFS: CategoryDef[] = [
  { id: 'vegetarian', label: 'Vegetarian', match: (l) => has(l, 'vegetarian') },
  { id: 'chicken', label: 'Chicken', match: (l) => has(l, 'chicken') },
  { id: 'beef', label: 'Beef', match: (l) => hasAny(l, ['beef', 'mutton']) },
  { id: 'seafood', label: 'Seafood', match: (l) => hasAny(l, ['seafood', 'shrimp']) },
  { id: 'snacks-drinks', label: 'Snacks & Drinks', match: (l) => hasAny(l, ['snack', 'appetizer', 'drink', 'chai']) },
];

export interface CategoryCount {
  id: string;
  label: string;
  count: number;
}

export function computeCategoryCounts(recipes: Recipe[]): CategoryCount[] {
  return CATEGORY_DEFS.map((cat) => ({
    id: cat.id,
    label: cat.label,
    count: recipes.filter((r) => cat.match(r.labels)).length,
  }));
}

export function findCategoryForLabel(label: string): CategoryDef | undefined {
  return CATEGORY_DEFS.find((c) => c.match([label]));
}
