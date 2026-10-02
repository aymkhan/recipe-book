// v2: recipes now live in Supabase (shared Postgres table "recipes") instead
// of localStorage, so every visitor sees the same data. Row Level Security on
// the table enforces that only a recipe's original submitter can update or
// delete it; these functions just call through to PostgREST via supabase-js.
import { supabase } from './supabaseClient';
import type { Recipe, RecipeSection } from '../types';

interface RecipeRow {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  sections: RecipeSection[] | null;
  labels: string[];
  photos: string[];
  video_thumbnail: string | null;
  prep_time: string | null;
  cook_time: string | null;
  servings: string | null;
  source: string | null;
  created_at: string;
  created_by: string;
  created_by_name: string;
}

function rowToRecipe(row: RecipeRow): Recipe {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    ingredients: row.ingredients,
    steps: row.steps,
    sections: row.sections ?? undefined,
    labels: row.labels,
    photos: row.photos,
    videoThumbnail: row.video_thumbnail ?? undefined,
    prepTime: row.prep_time ?? undefined,
    cookTime: row.cook_time ?? undefined,
    servings: row.servings ?? undefined,
    source: row.source ?? undefined,
    createdAt: row.created_at,
    createdBy: row.created_by,
    createdByName: row.created_by_name,
  };
}

export type RecipeDraft = Omit<Recipe, 'id' | 'createdAt' | 'createdBy' | 'createdByName'>;

function draftToInsertRow(draft: RecipeDraft, createdBy: string, createdByName: string) {
  return {
    title: draft.title,
    description: draft.description,
    ingredients: draft.ingredients,
    steps: draft.steps,
    sections: draft.sections ?? null,
    labels: draft.labels,
    photos: draft.photos,
    video_thumbnail: draft.videoThumbnail ?? null,
    prep_time: draft.prepTime ?? null,
    cook_time: draft.cookTime ?? null,
    servings: draft.servings ?? null,
    source: draft.source ?? null,
    created_by: createdBy,
    created_by_name: createdByName,
  };
}

function recipeToUpdateRow(recipe: Recipe) {
  return {
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
  };
}

export async function fetchRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase.from('recipes').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data as RecipeRow[]).map(rowToRecipe);
}

export async function insertRecipe(draft: RecipeDraft, createdBy: string, createdByName: string): Promise<Recipe> {
  const { data, error } = await supabase
    .from('recipes')
    .insert(draftToInsertRow(draft, createdBy, createdByName))
    .select()
    .single();
  if (error) throw error;
  return rowToRecipe(data as RecipeRow);
}

export async function updateRecipe(recipe: Recipe): Promise<Recipe> {
  const { data, error } = await supabase
    .from('recipes')
    .update(recipeToUpdateRow(recipe))
    .eq('id', recipe.id)
    .select()
    .single();
  if (error) throw error;
  return rowToRecipe(data as RecipeRow);
}

export async function deleteRecipeById(id: string): Promise<void> {
  const { error } = await supabase.from('recipes').delete().eq('id', id);
  if (error) throw error;
}
