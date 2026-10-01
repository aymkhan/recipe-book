import { Heart } from 'lucide-react';
import type { LabelCount } from '../lib/labels';
import { Chip } from './CategoryChips';

interface FamilyNavProps {
  labels: LabelCount[];
  active: string | null;
  onSelect: (label: string) => void;
}

export default function FamilyNav({ labels, active, onSelect }: FamilyNavProps) {
  if (labels.length === 0) return null;

  return (
    <div className="rounded-2xl border border-gold/40 bg-gold/10 px-4 py-3">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft mb-2">
        <Heart size={12} className="text-gold" /> Family recipes
      </p>
      <div className="flex gap-2 overflow-x-auto scrollbar-thin -mx-1 px-1">
        {labels.map(({ label, count }) => (
          <Chip
            key={label}
            label={label}
            count={count}
            isActive={active === label}
            onClick={() => onSelect(label)}
            accent="gold"
          />
        ))}
      </div>
    </div>
  );
}
