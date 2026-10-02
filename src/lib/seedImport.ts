// v2: one-time dev-only routine to bulk-insert the original 28 seed recipes
// into Supabase, attributed to whoever runs it. Only reachable in a dev build
// and only when the table is still empty, so it can't run in production or
// run twice.
import { supabase } from './supabaseClient';
import { seedRecipes } from '../data/seedRecipes';

export async function canImportSeedRecipes(): Promise<boolean> {
  if (!import.meta.env.DEV) return false;
  const { count, error } = await supabase.from('recipes').select('*', { count: 'exact', head: true });
  if (error) throw error;
  return count === 0;
}

export async function importSeedRecipes(createdBy: string, createdByName: string): Promise<number> {
  if (!(await canImportSeedRecipes())) {
    throw new Error('Seed import is only available once, when the recipes table is empty.');
  }
  const rows = seedRecipes.map((recipe) => ({
    title: recipe.title,
    description: recipe.description,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    sections: recipe.sections ?? null,
    labels: recipe.labels,
    photos: recipe.photos,
    video_thumbnail: recipe.videoThumbnail ?? null,
    prep_time: recipe.prepTime ?? null,
    cook_time: recipe.cookTime ?? null,
    servings: recipe.servings ?? null,
    source: recipe.source ?? null,
    created_at: recipe.createdAt,
    created_by: createdBy,
    created_by_name: createdByName,
  }));
  const { error } = await supabase.from('recipes').insert(rows);
  if (error) throw error;
  return rows.length;
}
