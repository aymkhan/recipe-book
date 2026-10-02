import { useEffect, useMemo, useState } from 'react';
import { UtensilsCrossed, X } from 'lucide-react';
import type { Recipe } from './types';
import { fetchRecipes, insertRecipe, updateRecipe, deleteRecipeById, type RecipeDraft } from './lib/storage';
// v2: auth + one-time seed bootstrap for the Supabase migration.
import { useAuth } from './context/AuthContext';
import { canImportSeedRecipes, importSeedRecipes } from './lib/seedImport';
import { collectLabels, splitFamilyLabels, canonicalFamilyLabel } from './lib/labels';
import { CATEGORY_DEFS, computeCategoryCounts, findCategoryForLabel } from './lib/categories';
import { applyTheme, getStoredTheme, type Theme } from './lib/theme';
import Header from './components/Header';
import { FamilyNavModern } from './components/FamilyNavVariants';
import CategoryChips from './components/CategoryChips';
import RecipeCard from './components/RecipeCard';
import RecipeDetailModal from './components/RecipeDetailModal';
import AddRecipeModal from './components/AddRecipeModal';
// v2: gate opening the Add recipe form behind sign-in, so nobody fills out a
// recipe only to find out at submit time that they needed to sign in first.
import SignInPrompt from './components/SignInPrompt';

type ActiveFilter = { source: 'label' | 'category'; value: string } | null;

function App() {
  const { user, displayName } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>(null);
  const [query, setQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme());
  const [canImport, setCanImport] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    fetchRecipes()
      .then(setRecipes)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load recipes.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user || !import.meta.env.DEV) {
      setCanImport(false);
      return;
    }
    canImportSeedRecipes().then(setCanImport).catch(() => setCanImport(false));
  }, [user, recipes.length]);

  const labelCounts = useMemo(() => collectLabels(recipes), [recipes]);
  const { family: familyLabelCounts } = useMemo(() => splitFamilyLabels(labelCounts), [labelCounts]);
  const categoryCounts = useMemo(() => computeCategoryCounts(recipes), [recipes]);

  const filteredRecipes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return recipes.filter((recipe) => {
      if (activeFilter) {
        const matches =
          activeFilter.source === 'label'
            ? recipe.labels.some((l) => l.toLowerCase() === activeFilter.value.toLowerCase())
            : (CATEGORY_DEFS.find((c) => c.id === activeFilter.value)?.match(recipe.labels) ?? true);
        if (!matches) return false;
      }
      if (!q) return true;
      const haystack = [recipe.title, recipe.description, ...recipe.labels, ...recipe.ingredients]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [recipes, activeFilter, query]);

  const handleSaveRecipe = async (draft: RecipeDraft) => {
    if (!user) {
      setError('Sign in to add/edit recipe.');
      return;
    }
    try {
      const created = await insertRecipe(draft, user.id, displayName || user.email || 'Someone');
      setRecipes((prev) => [created, ...prev]);
      setIsAddOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the recipe.');
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    try {
      await deleteRecipeById(id);
      setRecipes((prev) => prev.filter((r) => r.id !== id));
      setSelectedRecipe(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete the recipe.');
    }
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setSelectedRecipe(null);
    setEditingRecipe(recipe);
  };

  const handleUpdateRecipe = async (updated: Recipe) => {
    try {
      const saved = await updateRecipe(updated);
      setRecipes((prev) => prev.map((r) => (r.id === saved.id ? saved : r)));
      setEditingRecipe(null);
      setSelectedRecipe(saved);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update the recipe.');
    }
  };

  const handleImportSeed = async () => {
    if (!user) return;
    setImporting(true);
    try {
      await importSeedRecipes(user.id, displayName || user.email || 'Owner');
      setRecipes(await fetchRecipes());
      setCanImport(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Seed import failed.');
    } finally {
      setImporting(false);
    }
  };

  const handleSelectLabelFromDetail = (label: string) => {
    const family = canonicalFamilyLabel(label);
    if (family) {
      setActiveFilter({ source: 'label', value: family });
      return;
    }
    const category = findCategoryForLabel(label);
    setActiveFilter(category ? { source: 'category', value: category.id } : { source: 'label', value: label });
  };

  const hasActiveFilters = activeFilter !== null || query.trim() !== '';
  const clearFilters = () => {
    setActiveFilter(null);
    setQuery('');
  };

  const handleOpenAddRecipe = () => {
    if (!user) {
      setShowSignInPrompt(true);
      return;
    }
    setIsAddOpen(true);
  };

  return (
    <div className="min-h-screen bg-cream">
      <Header
        query={query}
        onQueryChange={setQuery}
        onAddRecipe={handleOpenAddRecipe}
        recipeCount={recipes.length}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col gap-4">
        {error && (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5">
            <span>{error}</span>
            <button onClick={() => setError('')} aria-label="Dismiss" className="shrink-0 hover:text-red-900">
              <X size={15} />
            </button>
          </div>
        )}

        {canImport && (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-basil/10 border border-basil/30 text-basil-dark text-sm px-4 py-2.5">
            <span>The recipe table is empty. Import the original seed recipes under your account?</span>
            <button
              onClick={handleImportSeed}
              disabled={importing}
              className="shrink-0 font-medium hover:underline disabled:opacity-60 cursor-pointer"
            >
              {importing ? 'Importing...' : 'Import seed recipes'}
            </button>
          </div>
        )}

        {hasActiveFilters && (
          <div className="flex justify-end">
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-sm font-medium text-clay bg-clay/10 hover:bg-clay/15 rounded-full px-3.5 py-1.5"
            >
              <X size={14} /> Clear filters
            </button>
          </div>
        )}

        <FamilyNavModern
          labels={familyLabelCounts}
          active={activeFilter?.source === 'label' ? activeFilter.value : null}
          onSelect={(label) => setActiveFilter({ source: 'label', value: label })}
        />

        <CategoryChips
          categories={categoryCounts}
          activeId={activeFilter?.source === 'category' ? activeFilter.value : null}
          onSelect={(id) => setActiveFilter(id ? { source: 'category', value: id } : null)}
          totalCount={recipes.length}
        />

        {loading ? (
          <div className="flex flex-col items-center justify-center text-center py-24 gap-3">
            <p className="text-sm text-ink-soft">Loading recipes...</p>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-24 gap-3">
            <div className="w-14 h-14 rounded-full bg-cream-dark flex items-center justify-center text-ink-soft">
              <UtensilsCrossed size={24} />
            </div>
            <p className="text-ink font-medium">No recipes found</p>
            <p className="text-sm text-ink-soft max-w-xs">
              Try a different category or search term, or add a new recipe to your book.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} onOpen={setSelectedRecipe} />
            ))}
          </div>
        )}
      </main>

      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onDelete={handleDeleteRecipe}
          onEdit={handleEditRecipe}
          onSelectLabel={handleSelectLabelFromDetail}
          canEdit={user?.id === selectedRecipe.createdBy}
        />
      )}

      {(isAddOpen || editingRecipe) && (
        <AddRecipeModal
          recipe={editingRecipe ?? undefined}
          onClose={() => {
            setIsAddOpen(false);
            setEditingRecipe(null);
          }}
          onCreate={handleSaveRecipe}
          onUpdate={handleUpdateRecipe}
          existingLabels={labelCounts.map((l) => l.label)}
        />
      )}

      {showSignInPrompt && <SignInPrompt onClose={() => setShowSignInPrompt(false)} />}
    </div>
  );
}

export default App;
