import { Heart, User } from 'lucide-react';
import type { LabelCount } from '../lib/labels';

interface VariantProps {
  labels: LabelCount[];
  active: string | null;
  onSelect: (label: string) => void;
}

const AVATAR_COLORS = ['bg-clay', 'bg-basil', 'bg-gold'];

function initial(name: string) {
  return name.charAt(0).toUpperCase();
}

// A: Ticket / stamp, dashed borders, playful, no boxed container
export function FamilyNavTicket({ labels, active, onSelect }: VariantProps) {
  if (labels.length === 0) return null;
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft mb-2">
        <Heart size={12} className="text-clay" /> Family recipes
      </p>
      <div className="flex gap-2 overflow-x-auto scrollbar-thin">
        {labels.map(({ label, count }) => {
          const isActive = active === label;
          return (
            <button
              key={label}
              onClick={() => onSelect(label)}
              className={`shrink-0 flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium border-2 border-dashed transition-colors ${
                isActive
                  ? 'border-clay bg-clay text-white'
                  : 'border-cream-dark bg-surface text-ink-soft hover:border-clay hover:text-clay'
              }`}
            >
              {label}
              <span className={`text-xs ${isActive ? 'text-white/80' : 'text-ink-soft'}`}>{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// B: Warm gradient banner with glassy chips
export function FamilyNavGradient({ labels, active, onSelect }: VariantProps) {
  if (labels.length === 0) return null;
  return (
    <div className="rounded-2xl bg-gradient-to-r from-clay/25 via-gold/20 to-basil/15 p-4 shadow-sm">
      <p className="font-display text-sm font-semibold text-ink mb-2.5">✦ Family recipes</p>
      <div className="flex gap-2 overflow-x-auto scrollbar-thin">
        {labels.map(({ label, count }) => {
          const isActive = active === label;
          return (
            <button
              key={label}
              onClick={() => onSelect(label)}
              className={`shrink-0 flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium backdrop-blur transition-colors ${
                isActive
                  ? 'bg-gold text-neutral-900 shadow-sm'
                  : 'bg-white/40 text-ink hover:bg-white/60'
              }`}
            >
              {label}
              <span className={`text-xs rounded-full px-1.5 py-0.5 ${isActive ? 'bg-black/10' : 'bg-black/10'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// C: Avatar initials, story-bar style
export function FamilyNavAvatars({ labels, active, onSelect }: VariantProps) {
  if (labels.length === 0) return null;
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft mb-2.5">
        <User size={12} className="text-clay" /> Family recipes
      </p>
      <div className="flex gap-4 overflow-x-auto scrollbar-thin pb-1">
        {labels.map(({ label, count }, i) => {
          const isActive = active === label;
          return (
            <button
              key={label}
              onClick={() => onSelect(label)}
              className="shrink-0 flex flex-col items-center gap-1.5 w-16"
            >
              <div className="relative">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-display font-semibold text-lg ${AVATAR_COLORS[i % AVATAR_COLORS.length]} ${
                    isActive ? 'ring-2 ring-offset-2 ring-offset-cream ring-clay' : ''
                  }`}
                >
                  {initial(label)}
                </div>
                <span className="absolute -bottom-1 -right-1 text-[10px] leading-none bg-cream-dark text-ink-soft rounded-full w-5 h-5 flex items-center justify-center border-2 border-cream">
                  {count}
                </span>
              </div>
              <span className={`text-xs truncate w-full text-center ${isActive ? 'text-clay font-semibold' : 'text-ink-soft'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const SOLID_COLORS = [
  { bg: 'bg-clay', text: 'text-white', count: 'text-white/75' },
  { bg: 'bg-basil', text: 'text-white', count: 'text-white/75' },
  { bg: 'bg-gold', text: 'text-neutral-900', count: 'text-neutral-900/60' },
];

// E: Modern solid pills, full name inside, no boxed card, no plain circles
export function FamilyNavModern({ labels, active, onSelect }: VariantProps) {
  if (labels.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft mb-2.5">Family recipes</p>
      <div className="flex gap-3 overflow-x-auto scrollbar-thin pb-1 -mx-1 px-1">
        {labels.map(({ label, count }, i) => {
          const isActive = active === label;
          const color = SOLID_COLORS[i % SOLID_COLORS.length];
          return (
            <button
              key={label}
              onClick={() => onSelect(label)}
              className={`shrink-0 inline-flex items-center gap-2 rounded-lg ${color.bg} px-5 py-3 shadow-sm transition-all duration-200 cursor-pointer hover:shadow-md hover:brightness-110 ${
                isActive ? 'ring-2 ring-offset-2 ring-offset-cream ring-ink/70 shadow-md' : ''
              }`}
            >
              <span className={`font-display font-semibold text-sm ${color.text}`}>{label}</span>
              <span className={`text-xs font-medium ${color.count}`}>{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// D: Minimal underline tabs, no card chrome at all
export function FamilyNavMinimal({ labels, active, onSelect }: VariantProps) {
  if (labels.length === 0) return null;
  return (
    <div className="border-y border-cream-dark py-2.5">
      <div className="flex items-center gap-4 overflow-x-auto scrollbar-thin">
        <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-ink-soft">Family</span>
        {labels.map(({ label, count }) => {
          const isActive = active === label;
          return (
            <button
              key={label}
              onClick={() => onSelect(label)}
              className={`shrink-0 flex items-center gap-1 text-sm pb-0.5 border-b-2 transition-colors ${
                isActive ? 'border-clay text-clay font-semibold' : 'border-transparent text-ink-soft hover:text-ink'
              }`}
            >
              {label}
              <span className="text-xs">({count})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
