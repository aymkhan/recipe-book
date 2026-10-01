import { Clock, Users } from 'lucide-react';
import type { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  onOpen: (recipe: Recipe) => void;
}

export default function RecipeCard({ recipe, onOpen }: RecipeCardProps) {
  return (
    <button
      onClick={() => onOpen(recipe)}
      className="group text-left bg-surface rounded-2xl overflow-hidden shadow-sm border border-cream-dark hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col cursor-pointer"
    >
      <div className="aspect-[4/3] overflow-hidden bg-cream-dark">
        {recipe.videoThumbnail ? (
          <video
            src={recipe.videoThumbnail}
            poster={recipe.photos[0]}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : recipe.photos[0] ? (
          <img
            src={recipe.photos[0]}
            alt={recipe.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-soft text-sm">No photo</div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-display font-semibold text-ink leading-snug line-clamp-2">{recipe.title}</h3>
        <p className="text-sm text-ink-soft line-clamp-2">{recipe.description}</p>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {recipe.labels.slice(0, 3).map((label) => (
            <span
              key={label}
              className="text-xs capitalize bg-basil/10 text-basil-dark rounded-full px-2 py-0.5 font-medium"
            >
              {label}
            </span>
          ))}
          {recipe.labels.length > 3 && (
            <span className="text-xs text-ink-soft px-1 py-0.5">+{recipe.labels.length - 3}</span>
          )}
        </div>
        <div className="mt-auto pt-2 flex items-center gap-3 text-xs text-ink-soft">
          {recipe.cookTime && (
            <span className="flex items-center gap-1">
              <Clock size={13} /> {recipe.cookTime}
            </span>
          )}
          {recipe.servings && (
            <span className="flex items-center gap-1">
              <Users size={13} /> {recipe.servings}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
