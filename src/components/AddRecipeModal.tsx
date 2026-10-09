import { useRef, useState, type FormEvent } from 'react';
import { X, ImagePlus, Trash2, FileUp, Sparkles, Loader2 } from 'lucide-react';
import type { Recipe } from '../types';
import type { RecipeDraft } from '../lib/storage';
// v2: new photo uploads go to Supabase Storage instead of being embedded as base64.
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import TagInput from './TagInput';
import DynamicListInput from './DynamicListInput';
import { extractPdfText } from '../lib/pdfText';
import { parseRecipeText } from '../lib/recipeParser';

// v2: auto-capitalize user input so lowercase entries read naturally without
// forcing the user to type it correctly themselves.
function capitalizeFirst(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function capitalizeWords(text: string): string {
  return text.split(' ').map(capitalizeFirst).join(' ');
}

interface AddRecipeModalProps {
  onClose: () => void;
  onCreate: (draft: RecipeDraft) => void;
  onUpdate: (recipe: Recipe) => void;
  existingLabels: string[];
  /** When provided, the modal edits this recipe in place instead of creating a new one. */
  recipe?: Recipe;
}

export default function AddRecipeModal({ onClose, onCreate, onUpdate, existingLabels, recipe }: AddRecipeModalProps) {
  const { user } = useAuth();
  const isEditing = Boolean(recipe);
  const [title, setTitle] = useState(recipe?.title ?? '');
  const [description, setDescription] = useState(recipe?.description ?? '');
  const [ingredients, setIngredients] = useState<string[]>(recipe?.ingredients.length ? recipe.ingredients : []);
  const [steps, setSteps] = useState<string[]>(recipe?.steps.length ? recipe.steps : []);
  const [labels, setLabels] = useState<string[]>(recipe?.labels ?? []);
  const [photos, setPhotos] = useState<string[]>(recipe?.photos ?? []);
  const [prepTime, setPrepTime] = useState(recipe?.prepTime ?? '');
  const [cookTime, setCookTime] = useState(recipe?.cookTime ?? '');
  const [servings, setServings] = useState(recipe?.servings ?? '');
  const [error, setError] = useState('');
  const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [recipeFile, setRecipeFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');
  const [importSource, setImportSource] = useState(recipe?.source ?? 'Added manually');
  const recipeFileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    if (!user) {
      setError('Sign in to add/edit recipe.');
      return;
    }
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    try {
      const urls = await Promise.all(
        files.map(async (file) => {
          const path = `${user.id}/${crypto.randomUUID()}-${file.name}`;
          const { error: uploadError } = await supabase.storage.from('recipe-photos').upload(path, file);
          if (uploadError) throw uploadError;
          return supabase.storage.from('recipe-photos').getPublicUrl(path).data.publicUrl;
        }),
      );
      setPhotos((prev) => [...prev, ...urls]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not upload one or more photos.');
    }
  };

  const handleRecipeFileSelect = (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isTxt = file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt');
    if (!isPdf && !isTxt) {
      setGenerateError('Please choose a .pdf or .txt file.');
      return;
    }
    setGenerateError('');
    setRecipeFile(file);
    setPastedText('');
  };

  const handleGenerate = async () => {
    setGenerateError('');
    if (!recipeFile && !pastedText.trim()) {
      setGenerateError('Paste some recipe text or upload a .pdf/.txt file first.');
      return;
    }

    setIsGenerating(true);
    try {
      let rawText: string;
      let sourceLabel: string;
      const fallbackTitle = recipeFile ? recipeFile.name.replace(/\.(pdf|txt)$/i, '') : '';

      if (recipeFile) {
        const isPdf = recipeFile.type === 'application/pdf' || recipeFile.name.toLowerCase().endsWith('.pdf');
        rawText = isPdf ? await extractPdfText(recipeFile) : await recipeFile.text();
        sourceLabel = `Imported from ${recipeFile.name}`;
      } else {
        rawText = pastedText;
        sourceLabel = 'Pasted recipe text';
      }

      if (!rawText.trim()) {
        setGenerateError('Could not find any text in that file. It may be a scanned image without a text layer.');
        return;
      }

      const parsed = parseRecipeText(rawText, fallbackTitle);
      setTitle(parsed.title);
      setDescription(parsed.description);
      setIngredients(parsed.ingredients.length > 0 ? parsed.ingredients : ['']);
      setSteps(parsed.steps.length > 0 ? parsed.steps : ['']);
      setImportSource(sourceLabel);
    } catch {
      setGenerateError('Something went wrong reading that file. Double-check it opens normally and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const trySave = (): boolean => {
    if (!title.trim()) {
      setError('Please give your recipe a title.');
      return false;
    }
    const cleanIngredients = ingredients.map((i) => capitalizeFirst(i.trim())).filter(Boolean);
    const cleanSteps = steps.map((s) => capitalizeFirst(s.trim())).filter(Boolean);
    if (cleanIngredients.length === 0 && cleanSteps.length === 0) {
      setError('Add at least one ingredient or step.');
      return false;
    }

    const draft: RecipeDraft = {
      title: capitalizeWords(title.trim()),
      description: capitalizeFirst(description.trim()),
      ingredients: cleanIngredients,
      steps: cleanSteps,
      sections: recipe?.sections,
      labels,
      photos,
      prepTime: prepTime.trim() || undefined,
      cookTime: cookTime.trim() || undefined,
      servings: servings.trim() || undefined,
      source: importSource,
    };
    if (recipe) {
      onUpdate({ ...draft, id: recipe.id, createdAt: recipe.createdAt, createdBy: recipe.createdBy, createdByName: recipe.createdByName });
    } else {
      onCreate(draft);
    }
    return true;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    trySave();
  };

  // v2: guard against losing typed-but-unsaved data when the user tries to
  // close the dialog via the X or Cancel button instead of Save.
  const hasUnsavedChanges = () => {
    const initialIngredients = recipe?.ingredients ?? [];
    const initialSteps = recipe?.steps ?? [];
    const initialLabels = recipe?.labels ?? [];
    const initialPhotos = recipe?.photos ?? [];
    return (
      title.trim() !== (recipe?.title ?? '') ||
      description.trim() !== (recipe?.description ?? '') ||
      JSON.stringify(ingredients) !== JSON.stringify(initialIngredients) ||
      JSON.stringify(steps) !== JSON.stringify(initialSteps) ||
      JSON.stringify(labels) !== JSON.stringify(initialLabels) ||
      JSON.stringify(photos) !== JSON.stringify(initialPhotos) ||
      prepTime.trim() !== (recipe?.prepTime ?? '') ||
      cookTime.trim() !== (recipe?.cookTime ?? '') ||
      servings.trim() !== (recipe?.servings ?? '')
    );
  };

  const requestClose = () => {
    if (hasUnsavedChanges()) setShowUnsavedPrompt(true);
    else onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-cream w-full sm:max-w-2xl sm:rounded-3xl rounded-t-3xl max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-cream/95 backdrop-blur z-10 flex items-center justify-between px-5 sm:px-7 py-4 border-b border-cream-dark">
          <h2 className="font-display text-xl font-semibold text-ink">{isEditing ? 'Edit recipe' : 'Add a recipe'}</h2>
          <button onClick={requestClose} className="p-2 rounded-full hover:bg-cream-dark" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-7 flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Photos</label>
            <div className="flex flex-wrap gap-3">
              {photos.map((photo, i) => (
                <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden group">
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    aria-label="Remove photo"
                  >
                    <Trash2 size={18} className="text-white" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-xl border-2 border-dashed border-cream-dark hover:border-clay flex flex-col items-center justify-center gap-1 text-ink-soft hover:text-clay"
              >
                <ImagePlus size={20} />
                <span className="text-xs">Upload</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                multiple
                className="hidden"
                onChange={(e) => handlePhotoUpload(e.target.files)}
              />
            </div>
            <p className="text-xs text-ink-soft mt-1.5">
              Optional. PNG or JPEG photos from your camera roll or screenshots.
            </p>
          </div>

          <div className="rounded-2xl border border-clay/30 bg-clay/5 p-4 flex flex-col gap-3">
            <div>
              <p className="text-sm font-medium text-ink">Fill in from your recipe notes</p>
              <p className="text-xs text-ink-soft mt-0.5">
                Paste the recipe text below, or upload a .pdf/.txt file, whichever's easier. We'll pull out the
                title, description, ingredients, and steps for you to review.
              </p>
            </div>

            <textarea
              value={pastedText}
              onChange={(e) => {
                setPastedText(e.target.value);
                if (e.target.value) setRecipeFile(null);
              }}
              placeholder="Paste your recipe text here..."
              rows={4}
              className="w-full rounded-xl border border-cream-dark bg-surface px-3 py-2.5 text-sm outline-none focus:border-clay resize-none"
            />

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-cream-dark" />
              <span className="text-xs text-ink-soft">OR</span>
              <div className="h-px flex-1 bg-cream-dark" />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => recipeFileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-sm rounded-full border border-cream-dark bg-surface px-3.5 py-2 hover:border-clay hover:text-clay"
              >
                <FileUp size={15} /> {recipeFile ? recipeFile.name : 'Upload .pdf or .txt'}
              </button>
              {recipeFile && (
                <button
                  type="button"
                  onClick={() => setRecipeFile(null)}
                  className="text-xs text-ink-soft hover:text-red-500"
                >
                  Remove file
                </button>
              )}
              <input
                ref={recipeFileInputRef}
                type="file"
                accept=".pdf,.txt,application/pdf,text/plain"
                className="hidden"
                onChange={(e) => handleRecipeFileSelect(e.target.files)}
              />

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="ml-auto flex items-center gap-1.5 text-sm font-medium rounded-full bg-clay text-white px-4 py-2 hover:bg-clay-dark disabled:opacity-60"
              >
                {isGenerating ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                {isGenerating ? 'Reading...' : 'Auto-fill recipe'}
              </button>
            </div>

            {generateError && <p className="text-sm text-red-500">{generateError}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mom's Beef Biryani"
              className="w-full rounded-xl border border-cream-dark bg-surface px-3 py-2.5 text-sm outline-none focus:border-clay"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short note about this recipe: where it's from, why you saved it..."
              rows={2}
              className="w-full rounded-xl border border-cream-dark bg-surface px-3 py-2.5 text-sm outline-none focus:border-clay resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Prep time</label>
              <input
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                placeholder="15 min"
                className="w-full rounded-xl border border-cream-dark bg-surface px-3 py-2.5 text-sm outline-none focus:border-clay"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Cook time</label>
              <input
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
                placeholder="30 min"
                className="w-full rounded-xl border border-cream-dark bg-surface px-3 py-2.5 text-sm outline-none focus:border-clay"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Servings</label>
              <input
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                placeholder="4"
                className="w-full rounded-xl border border-cream-dark bg-surface px-3 py-2.5 text-sm outline-none focus:border-clay"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Labels <span className="text-ink-soft font-normal">(e.g. beef, mom, Pakistani)</span>
            </label>
            <TagInput
              tags={labels}
              onChange={setLabels}
              placeholder="Type a label and press Enter"
              suggestions={existingLabels}
            />
          </div>

          {recipe?.sections && recipe.sections.length > 0 && (
            <p className="text-xs text-ink-soft bg-cream-dark rounded-xl px-3 py-2.5">
              This recipe has multiple sections ({recipe.sections.map((s) => s.title).join(', ')}) shown on its
              detail page. Those aren't editable here; anything you add below appears as regular ingredients/steps
              alongside them.
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Ingredients <span className="text-ink-soft font-normal">(auto-filled above, or add your own)</span>
            </label>
            <DynamicListInput items={ingredients} onChange={setIngredients} placeholder="Ingredient" />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Steps <span className="text-ink-soft font-normal">(auto-filled above, or add your own)</span>
            </label>
            <DynamicListInput items={steps} onChange={setSteps} placeholder="Step" numbered />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={requestClose}
              className="flex-1 py-2.5 rounded-full border border-cream-dark text-ink-soft font-medium hover:bg-cream-dark"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-full bg-clay text-white font-medium hover:bg-clay-dark shadow-sm"
            >
              {isEditing ? 'Save changes' : 'Save recipe'}
            </button>
          </div>
        </form>
      </div>

      {showUnsavedPrompt && (
        <div
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowUnsavedPrompt(false)}
        >
          <div
            className="bg-cream w-full max-w-sm rounded-2xl shadow-2xl p-5 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-semibold text-ink">Save changes?</h3>
                <p className="text-sm text-ink-soft mt-1">You have unsaved changes to this recipe.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowUnsavedPrompt(false)}
                className="shrink-0 p-1.5 rounded-full hover:bg-cream-dark"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowUnsavedPrompt(false);
                  onClose();
                }}
                className="flex-1 py-2.5 rounded-full border border-cream-dark text-ink-soft font-medium hover:bg-cream-dark"
              >
                Discard changes
              </button>
              <button
                type="button"
                onClick={() => {
                  trySave();
                  setShowUnsavedPrompt(false);
                }}
                className="flex-1 py-2.5 rounded-full bg-clay text-white font-medium hover:bg-clay-dark shadow-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
