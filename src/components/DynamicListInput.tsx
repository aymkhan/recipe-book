import { Plus, X } from 'lucide-react';

interface DynamicListInputProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
  numbered?: boolean;
}

export default function DynamicListInput({ items, onChange, placeholder, numbered }: DynamicListInputProps) {
  const update = (index: number, value: string) => {
    const next = [...items];
    next[index] = value;
    onChange(next);
  };

  const remove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const add = () => onChange([...items, '']);

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          {numbered && (
            <span className="shrink-0 w-6 h-6 rounded-full bg-cream-dark text-ink-soft text-xs font-semibold flex items-center justify-center">
              {i + 1}
            </span>
          )}
          <input
            value={item}
            onChange={(e) => update(i, e.target.value)}
            placeholder={`${placeholder} ${i + 1}`}
            className="flex-1 rounded-xl border border-cream-dark bg-surface px-3 py-2 text-sm outline-none focus:border-clay"
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="shrink-0 text-ink-soft hover:text-red-500 p-1"
            aria-label="Remove"
          >
            <X size={16} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="self-start flex items-center gap-1.5 text-sm text-clay font-medium hover:text-clay-dark mt-1"
      >
        <Plus size={16} /> Add {placeholder.toLowerCase()}
      </button>
    </div>
  );
}
