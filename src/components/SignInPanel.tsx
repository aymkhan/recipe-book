// v2: email magic-link sign-in UI, plus a one-time "what should we call you"
// prompt so new recipes can be attributed to their submitter.
import { useState } from 'react';
import { LogOut, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SignInPanel() {
  const { user, displayName, signInWithEmail, signOut, setDisplayName } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [nameError, setNameError] = useState('');

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const { error: err } = await signInWithEmail(email.trim());
    if (err) setError(err);
    else setSent(true);
  };

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    setNameError('');
    const { error: err } = await setDisplayName(nameInput.trim());
    if (err) setNameError(err);
  };

  if (user && !displayName) {
    return (
      <form onSubmit={handleSaveName} className="flex items-center gap-2">
        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="What should we call you?"
          className="text-sm px-3 py-1.5 rounded-full border border-cream-dark bg-surface text-ink w-44"
          autoFocus
        />
        <button type="submit" className="text-sm font-medium text-clay hover:underline">
          Save
        </button>
        {nameError && <span className="text-xs text-red-500">{nameError}</span>}
      </form>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="text-ink-soft">{displayName || user.email}</span>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-1 text-ink-soft hover:text-clay cursor-pointer"
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-clay cursor-pointer"
      >
        <Mail size={15} /> Sign in
      </button>
    );
  }

  if (sent) {
    return <span className="text-sm text-ink-soft">Check your email for a sign-in link.</span>;
  }

  return (
    <form onSubmit={handleSendLink} className="flex items-center gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="text-sm px-3 py-1.5 rounded-full border border-cream-dark bg-surface text-ink w-48"
        autoFocus
      />
      <button type="submit" className="text-sm font-medium text-clay hover:underline cursor-pointer">
        Send link
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </form>
  );
}
