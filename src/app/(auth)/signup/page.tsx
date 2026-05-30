'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-7 h-7 bg-[#FFDE4D] rounded-sm mb-5 mx-auto" />
          <h2 className="text-lg font-bold text-white mb-2">Check your email</h2>
          <p className="text-sm text-zinc-400">
            A confirmation link was sent to{' '}
            <span className="text-white font-medium">{email}</span>.
            Click it to activate your account.
          </p>
          <Link
            href="/login"
            className="inline-block mt-6 text-xs text-[#FFDE4D] hover:underline"
          >
            ← Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <div className="w-7 h-7 bg-[#FFDE4D] rounded-sm mb-4" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Create account</h1>
          <p className="text-zinc-500 text-sm mt-1">Track anything, your way</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label htmlFor="email" className="field-label">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm px-3 py-2.5 rounded-sm focus:outline-none focus:border-[#FFDE4D] transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="field-label">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm px-3 py-2.5 rounded-sm focus:outline-none focus:border-[#FFDE4D] transition-colors"
              placeholder="Min. 6 characters"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 border border-red-900 bg-red-950/30 px-3 py-2 rounded-sm">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full justify-center py-2.5 text-sm mt-2"
          >
            {loading ? 'Creating…' : 'Create Account'}
          </Button>
        </form>

        <p className="text-xs text-zinc-600 text-center mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-[#FFDE4D] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
