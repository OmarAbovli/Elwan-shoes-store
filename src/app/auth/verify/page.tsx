'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      if (res.ok) {
        router.push('/auth/login');
      } else {
        const data = await res.json();
        setError(data.error || 'Invalid code');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    await fetch('/api/auth/resend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="card text-center">
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📧</div>
          <h1>{t('verifyTitle')}</h1>
          <p>{t('verifyMsg')}</p>
          <p style={{ color: 'var(--color-secondary)', fontWeight: 600, marginBottom: '1rem' }}>{email}</p>

          <form onSubmit={handleVerify}>
            {error && (
              <div style={{
                padding: '0.75rem', marginBottom: '1rem',
                background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)',
                borderRadius: 'var(--radius-md)', color: 'var(--color-error)',
              }}>
                {error}
              </div>
            )}
            <input className="input" placeholder={t('verifyCode')} value={code}
              onChange={e => setCode(e.target.value)} required
              style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5em', marginBottom: '1rem' }} />
            <button className="btn btn-primary btn-lg w-full" type="submit" disabled={loading}>
              {loading ? '...' : t('verify')}
            </button>
          </form>

          <button className="btn btn-ghost" style={{ marginTop: '1rem' }} onClick={handleResend}>
            {t('resend')}
          </button>
        </div>
      </div>
    </div>
  );
}
