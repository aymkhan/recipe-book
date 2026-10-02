// v2: shown before the Add/Edit recipe form opens when nobody is signed in,
// so people never fill out a recipe only to discover at submit time that
// they needed to sign in first (and lose everything they typed).
import { useState, type FormEvent } from 'react';
import { X, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SignInPromptProps {
  onClose: () => void;
}

export default function SignInPrompt({ onClose }: SignInPromptProps) {
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const { error: err } = await signInWithEmail(email.trim());
    if (err) setError(err);
    else setSent(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-cream w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl shadow-2xl p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">Sign in to add/edit recipe</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-cream-dark" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {sent ? (
          <p className="text-sm text-ink-soft">Check your email for a sign-in link, then try again.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <p className="text-sm text-ink-soft">
              Enter your email for a quick passwordless sign up/sign in. We need to know who's submitting the
              recipe before you start.
            </p>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-full border border-cream-dark bg-surface pl-10 pr-4 py-2.5 text-sm outline-none focus:border-clay"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="py-2.5 rounded-full bg-clay text-white font-medium hover:bg-clay-dark shadow-sm"
            >
              Send sign-in link
            </button>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
