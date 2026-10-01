import { Search, Plus, ChefHat, X } from 'lucide-react';
import type { Theme } from '../lib/theme';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  query: string;
  onQueryChange: (q: string) => void;
  onAddRecipe: () => void;
  recipeCount: number;
  theme: Theme;
  onToggleTheme: () => void;
}

export default function Header({ query, onQueryChange, onAddRecipe, recipeCount, theme, onToggleTheme }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-cream/90 backdrop-blur border-b border-cream-dark">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-clay text-white flex items-center justify-center shrink-0">
              <ChefHat size={20} />
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold text-ink leading-tight">My Recipe Book</h1>
              <p className="text-xs text-ink-soft leading-tight">{recipeCount} saved recipes</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            <button
              onClick={onAddRecipe}
              className="flex items-center gap-1.5 bg-clay text-white rounded-full pl-3.5 pr-4 py-2.5 text-sm font-medium hover:bg-clay-dark shadow-sm"
            >
              <Plus size={17} />
              <span className="hidden sm:inline">Add recipe</span>
            </button>
          </div>
        </div>

        <div className="relative">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search recipes, ingredients, labels..."
            className="w-full rounded-full border border-cream-dark bg-surface pl-10 pr-9 py-2.5 text-sm outline-none focus:border-clay"
          />
          {query && (
            <button
              onClick={() => onQueryChange('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink p-1 rounded-full hover:bg-cream-dark"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
