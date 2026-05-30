'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8">
          <div className="w-7 h-7 bg-[#FFDE4D] rounded-sm mb-4" />
          <h1 className="text-2xl font-bold text-white tracking-tight">KuroBox</h1>
          <p className="text-zinc-500 text-sm mt-1">Sign in to your workspace</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm px-3 py-2.5 rounded-sm focus:outline-none focus:border-[#FFDE4D] transition-colors"
              placeholder="••••••••"
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
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>

        <p className="text-xs text-zinc-600 text-center mt-6">
          No account?{' '}
          <Link href="/signup" className="text-[#FFDE4D] hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
