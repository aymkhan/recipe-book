import { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}

export default function TagInput({ tags, onChange, placeholder, suggestions = [] }: TagInputProps) {
  const [draft, setDraft] = useState('');

  const addTag = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setDraft('');
      return;
    }
    onChange([...tags, trimmed]);
    setDraft('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(draft);
    } else if (e.key === 'Backspace' && draft === '' && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const filteredSuggestions = suggestions.filter(
    (s) => !tags.some((t) => t.toLowerCase() === s.toLowerCase()) && (draft === '' || s.toLowerCase().includes(draft.toLowerCase()))
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2 rounded-xl border border-cream-dark bg-surface px-3 py-2.5 focus-within:border-clay">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 text-xs capitalize bg-basil/10 text-basil-dark rounded-full pl-2.5 pr-1.5 py-1 font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              className="hover:bg-basil/20 rounded-full p-0.5"
              aria-label={`Remove ${tag}`}
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(draft)}
          placeholder={tags.length === 0 ? placeholder : 'Add another...'}
          className="flex-1 min-w-[120px] outline-none text-sm bg-transparent py-1"
        />
      </div>
      {filteredSuggestions.length > 0 && draft && (
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {filteredSuggestions.slice(0, 6).map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => addTag(s)}
              className="text-xs capitalize text-ink-soft bg-cream-dark rounded-full px-2 py-1 hover:bg-clay hover:text-white"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
