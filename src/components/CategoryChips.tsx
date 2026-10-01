import type { CategoryCount } from '../lib/categories';

interface CategoryChipsProps {
  categories: CategoryCount[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
  totalCount: number;
}

export default function CategoryChips({ categories, activeId, onSelect, totalCount }: CategoryChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
      <Chip label="All recipes" count={totalCount} isActive={activeId === null} onClick={() => onSelect(null)} />
      {categories.map(({ id, label, count }) => (
        <Chip key={id} label={label} count={count} isActive={activeId === id} onClick={() => onSelect(id)} />
      ))}
    </div>
  );
}

export function Chip({
  label,
  count,
  isActive,
  onClick,
  accent = 'clay',
}: {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
  accent?: 'clay' | 'gold';
}) {
  const activeClasses = accent === 'gold' ? 'bg-gold text-neutral-900 shadow-sm' : 'bg-clay text-white shadow-sm';
  const activeBadgeClasses = accent === 'gold' ? 'bg-black/10 text-neutral-900' : 'bg-white/25 text-white';

  return (
    <button
      onClick={onClick}
      className={`shrink-0 flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors whitespace-nowrap cursor-pointer ${
        isActive
          ? activeClasses
          : 'bg-surface text-ink-soft border border-cream-dark hover:border-clay hover:text-clay'
      }`}
    >
      {label}
      <span className={`text-xs rounded-full px-1.5 py-0.5 ${isActive ? activeBadgeClasses : 'bg-cream-dark text-ink-soft'}`}>
        {count}
      </span>
    </button>
  );
}
