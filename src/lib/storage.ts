import { seedRecipes } from '../data/seedRecipes';
import type { Recipe } from '../types';

const STORAGE_KEY = 'recipe-book:recipes:v1';

export function loadRecipes(): Recipe[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedRecipes));
      return seedRecipes;
    }
    const parsed = JSON.parse(raw) as Recipe[];
    return Array.isArray(parsed) ? parsed : seedRecipes;
  } catch {
    return seedRecipes;
  }
}

export function saveRecipes(recipes: Recipe[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  } catch {
    // localStorage may be unavailable (e.g. private browsing quota) — fail silently.
  }
}

export function resetToSeed(): Recipe[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seedRecipes));
  return seedRecipes;
}
