export interface RecipeSection {
  title: string;
  ingredients: string[];
  steps: string[];
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  /** For recipes that bundle multiple distinct variations (e.g. two versions
   * of the same dish): when present, the detail view renders these instead
   * of the flat ingredients/steps above. */
  sections?: RecipeSection[];
  labels: string[];
  photos: string[];
  /** Optional looping video (muted, GIF-style) shown on the recipe card thumbnail. */
  videoThumbnail?: string;
  prepTime?: string;
  cookTime?: string;
  servings?: string;
  source?: string;
  createdAt: string;
  // v2: who submitted this recipe (Supabase auth user id + a denormalized
  // display name), used to gate editing/deleting to the original submitter.
  createdBy: string;
  createdByName: string;
}
