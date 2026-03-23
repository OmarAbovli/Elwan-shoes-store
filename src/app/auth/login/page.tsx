'use client';

import { useTranslations } from 'next-intl';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(t('invalidCredentials'));
      setLoading(false);
    } else {
      // Check role for redirect
      const res = await fetch('/api/auth/me');
      const user = await res.json();
      if (user?.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Link href="/" style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '0.15em' }}>
              <span className="text-gold">ELWAN</span>
            </Link>
          </div>
          
          <h1>{t('loginTitle')}</h1>
          <p>{t('loginSubtitle')}</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <div style={{
                padding: '0.75rem 1rem',
                background: 'rgba(248, 113, 113, 0.1)',
                border: '1px solid rgba(248, 113, 113, 0.2)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-error)',
                fontSize: '0.9rem',
              }}>
                {error}
              </div>
            )}

            <div className="input-group">
              <label>{t('username')}</label>
              <input className="input" value={username}
                onChange={e => setUsername(e.target.value)} required autoFocus />
            </div>

            <div className="input-group">
              <label>{t('password')}</label>
              <input className="input" type="password" value={password}
                onChange={e => setPassword(e.target.value)} required />
            </div>

            <button className="btn btn-primary btn-lg w-full" type="submit" disabled={loading}>
              {loading ? '...' : t('login')}
            </button>
          </form>

          <div className="auth-footer">
            <p>{t('noAccount')} <Link href="/auth/register">{t('signUp')}</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
