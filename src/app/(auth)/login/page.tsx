'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import KuroBoxLogo from '@/components/navigation/KuroBoxLogo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
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

  const handleGoogleLogin = async () => {
    setOauthLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
      {/* Tactical auth card */}
      <div className="w-full max-w-sm bg-[var(--kb-surface)]/90 backdrop-blur-md border border-[var(--kb-border)] rounded-lg shadow-2xl shadow-black/30 overflow-hidden">

        {/* Header band */}
        <div className="px-6 pt-7 pb-5 border-b border-[var(--kb-border-subtle)] text-center">
          <div className="flex justify-center mb-4">
            <KuroBoxLogo size={48} />
          </div>
          <h1 className="text-xl font-bold text-[var(--kb-text)] tracking-tight">KuroBox</h1>
          <p className="font-mono text-[9px] text-zinc-600 mt-1 uppercase tracking-widest">
            SECURE WORKSPACE INTERFACE ACCESS // ログイン
          </p>
        </div>

        <div className="px-6 py-6 space-y-4">
          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={oauthLoading}
            className="w-full flex items-center justify-center gap-3 bg-[var(--kb-surface-alt)] border border-[var(--kb-border)] hover:border-[var(--kb-accent)] text-[var(--kb-text)] text-sm py-2.5 px-4 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {oauthLoading ? (
              <span className="w-4 h-4 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[var(--kb-border)]" />
            <span className="text-[10px] text-zinc-700 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-[var(--kb-border)]" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="field-label">Email</label>
              <input
                id="email" type="email" autoComplete="email"
                value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full bg-[var(--kb-surface-alt)] border border-[var(--kb-border)] text-[var(--kb-text)] text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-[var(--kb-accent)] transition-colors placeholder:text-zinc-700"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="field-label">Password</label>
              <input
                id="password" type="password" autoComplete="current-password"
                value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full bg-[var(--kb-surface-alt)] border border-[var(--kb-border)] text-[var(--kb-text)] text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-[var(--kb-accent)] transition-colors placeholder:text-zinc-700"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 border border-red-900 bg-red-950/30 px-3 py-2 rounded-lg">{error}</p>
            )}

            <Button
              type="submit" disabled={loading}
              className="w-full justify-center py-2.5 text-sm rounded-lg"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <p className="text-xs text-zinc-600 text-center">
            No account?{' '}
            <Link href="/signup" className="text-[var(--kb-accent)] hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
