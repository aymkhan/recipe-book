import { useEffect, useMemo, useState } from 'react';
import { UtensilsCrossed, X } from 'lucide-react';
import type { Recipe } from './types';
import { loadRecipes, saveRecipes } from './lib/storage';
import { collectLabels, splitFamilyLabels, canonicalFamilyLabel } from './lib/labels';
import { CATEGORY_DEFS, computeCategoryCounts, findCategoryForLabel } from './lib/categories';
import { applyTheme, getStoredTheme, type Theme } from './lib/theme';
import Header from './components/Header';
import { FamilyNavModern } from './components/FamilyNavVariants';
import CategoryChips from './components/CategoryChips';
import RecipeCard from './components/RecipeCard';
import RecipeDetailModal from './components/RecipeDetailModal';
import AddRecipeModal from './components/AddRecipeModal';

type ActiveFilter = { source: 'label' | 'category'; value: string } | null;

function App() {
  const [recipes, setRecipes] = useState<Recipe[]>(() => loadRecipes());
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>(null);
  const [query, setQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

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

  const persist = (next: Recipe[]) => {
    setRecipes(next);
    saveRecipes(next);
  };

  const handleSaveRecipe = (recipe: Recipe) => {
    persist([recipe, ...recipes]);
    setIsAddOpen(false);
  };

  const handleDeleteRecipe = (id: string) => {
    persist(recipes.filter((r) => r.id !== id));
    setSelectedRecipe(null);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setSelectedRecipe(null);
    setEditingRecipe(recipe);
  };

  const handleUpdateRecipe = (updated: Recipe) => {
    persist(recipes.map((r) => (r.id === updated.id ? updated : r)));
    setEditingRecipe(null);
    setSelectedRecipe(updated);
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

  return (
    <div className="min-h-screen bg-cream">
      <Header
        query={query}
        onQueryChange={setQuery}
        onAddRecipe={() => setIsAddOpen(true)}
        recipeCount={recipes.length}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col gap-4">
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

        {filteredRecipes.length === 0 ? (
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
        />
      )}

      {(isAddOpen || editingRecipe) && (
        <AddRecipeModal
          recipe={editingRecipe ?? undefined}
          onClose={() => {
            setIsAddOpen(false);
            setEditingRecipe(null);
          }}
          onSave={editingRecipe ? handleUpdateRecipe : handleSaveRecipe}
          existingLabels={labelCounts.map((l) => l.label)}
        />
      )}
    </div>
  );
}

export default App;
