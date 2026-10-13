import { useState } from 'react';
import { X, Clock, Users, ChefHat, Trash2, Tag, Pencil } from 'lucide-react';
import type { Recipe } from '../types';

interface RecipeDetailModalProps {
  recipe: Recipe;
  onClose: () => void;
  onDelete: (id: string) => void;
  onEdit: (recipe: Recipe) => void;
  onSelectLabel: (label: string) => void;
  // v2: only the recipe's original submitter sees the Edit/Delete controls.
  // This is a UX nicety; the real enforcement is Supabase Row Level Security.
  canEdit: boolean;
}

export default function RecipeDetailModal({ recipe, onClose, onDelete, onEdit, onSelectLabel, canEdit }: RecipeDetailModalProps) {
  const [activePhoto, setActivePhoto] = useState(0);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-cream w-full sm:max-w-2xl sm:rounded-3xl rounded-t-3xl max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[4/3] sm:aspect-[16/9] bg-cream-dark">
          {recipe.videoThumbnail && activePhoto === 0 ? (
            <video
              key={recipe.videoThumbnail}
              src={recipe.videoThumbnail}
              poster={recipe.photos[0]}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : recipe.photos[activePhoto] ? (
            <img src={recipe.photos[activePhoto]} alt={recipe.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ink-soft">No photo</div>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full p-2 shadow-sm"
            aria-label="Close"
          >
            <X size={18} className="text-neutral-800" />
          </button>
          {recipe.photos.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {recipe.photos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhoto(i)}
                  aria-label={`Show photo ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === activePhoto ? 'w-6 bg-white' : 'w-1.5 bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="p-5 sm:p-7 flex flex-col gap-5">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink">{recipe.title}</h2>
            <p className="text-ink-soft mt-1.5 leading-relaxed">{recipe.description}</p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-ink-soft border-y border-cream-dark py-3">
            {recipe.prepTime && (
              <span className="flex items-center gap-1.5">
                <ChefHat size={16} className="text-clay" /> Prep {recipe.prepTime}
              </span>
            )}
            {recipe.cookTime && (
              <span className="flex items-center gap-1.5">
                <Clock size={16} className="text-clay" /> Cook {recipe.cookTime}
              </span>
            )}
            {recipe.servings && (
              <span className="flex items-center gap-1.5">
                <Users size={16} className="text-clay" /> Serves {recipe.servings}
              </span>
            )}
            {recipe.source && <span className="ml-auto italic">Saved from {recipe.source}</span>}
          </div>

          <div className="flex flex-wrap gap-2">
            {recipe.labels.map((label) => (
              <button
                key={label}
                onClick={() => {
                  onSelectLabel(label);
                  onClose();
                }}
                className="flex items-center gap-1 text-xs capitalize bg-basil/10 text-basil-dark rounded-full px-2.5 py-1 font-medium hover:bg-basil/20"
              >
                <Tag size={11} /> {label}
              </button>
            ))}
          </div>

          {recipe.sections && recipe.sections.length > 0 ? (
            recipe.sections.map((section, sIdx) => (
              <div key={sIdx} className="flex flex-col gap-4">
                <h3 className="font-display text-lg font-semibold text-ink border-b border-cream-dark pb-2">
                  {section.title}
                </h3>

                <div>
                  <h4 className="font-display font-semibold text-ink mb-2 text-sm">Ingredients</h4>
                  <ul className="space-y-1.5">
                    {section.ingredients.map((ing, i) => (
                      <li key={i} className="flex gap-2 text-sm text-ink-soft">
                        <span className="text-clay mt-1.5 block w-1 h-1 rounded-full bg-clay shrink-0" />
                        {ing}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-display font-semibold text-ink mb-2 text-sm">Steps</h4>
                  <ol className="space-y-3">
                    {section.steps.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm text-ink-soft leading-relaxed">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-clay text-white text-xs font-semibold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            ))
          ) : (
            <>
              <div>
                <h3 className="font-display font-semibold text-ink mb-2">Ingredients</h3>
                <ul className="space-y-1.5">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex gap-2 text-sm text-ink-soft">
                      <span className="text-clay mt-1.5 block w-1 h-1 rounded-full bg-clay shrink-0" />
                      {ing}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-display font-semibold text-ink mb-2">Steps</h3>
                <ol className="space-y-3">
                  {recipe.steps.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm text-ink-soft leading-relaxed">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-clay text-white text-xs font-semibold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </>
          )}

          {canEdit && (
            <div className="pt-2 border-t border-cream-dark">
              {confirmingDelete ? (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-ink-soft">Delete this recipe?</span>
                  <button
                    onClick={() => onDelete(recipe.id)}
                    className="px-3 py-1.5 rounded-full bg-red-500 text-white font-medium hover:bg-red-600"
                  >
                    Yes, delete
                  </button>
                  <button
                    onClick={() => setConfirmingDelete(false)}
                    className="px-3 py-1.5 rounded-full border border-cream-dark text-ink-soft hover:bg-cream-dark"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => onEdit(recipe)}
                    className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-clay"
                  >
                    <Pencil size={15} /> Edit recipe
                  </button>
                  <button
                    onClick={() => setConfirmingDelete(true)}
                    className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-red-500"
                  >
                    <Trash2 size={15} /> Delete recipe
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
