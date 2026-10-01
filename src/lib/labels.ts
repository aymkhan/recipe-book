import type { Recipe } from '../types';

export interface LabelCount {
  label: string;
  count: number;
}

// Family members whose recipes get their own featured nav row instead of
// being buried in the general category chip list.
export const FAMILY_LABELS = ['Ammi', 'Abbu', 'Ammijaan', 'Kaka', 'Munji'];

// Matches a label against FAMILY_LABELS regardless of how the user typed the
// casing (e.g. "kaka", "KAKA", "Kaka" all resolve to the same person), and
// returns the canonical display spelling.
export function canonicalFamilyLabel(label: string): string | null {
  const trimmed = label.trim().toLowerCase();
  return FAMILY_LABELS.find((f) => f.toLowerCase() === trimmed) ?? null;
}

export function splitFamilyLabels(labelCounts: LabelCount[]): {
  family: LabelCount[];
  other: LabelCount[];
} {
  const familyCounts = new Map<string, number>();
  const other: LabelCount[] = [];
  for (const lc of labelCounts) {
    const canonical = canonicalFamilyLabel(lc.label);
    if (canonical) {
      familyCounts.set(canonical, (familyCounts.get(canonical) ?? 0) + lc.count);
    } else {
      other.push(lc);
    }
  }
  const family = Array.from(familyCounts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  return { family, other };
}

export function collectLabels(recipes: Recipe[]): LabelCount[] {
  const counts = new Map<string, number>();
  for (const recipe of recipes) {
    for (const label of recipe.labels) {
      const normalized = label.trim();
      if (!normalized) continue;
      counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function parseLabelInput(input: string): string[] {
  return Array.from(
    new Set(
      input
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    )
  );
}
