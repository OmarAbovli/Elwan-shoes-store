'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const governorates = [
  'Cairo','Giza','Alexandria','Dakahlia','Sharqia','Monufia','Qalyubia',
  'Beheira','Gharbia','Kafr El Sheikh','Damietta','Port Said','Ismailia',
  'Suez','Fayoum','Beni Suef','Minya','Assiut','Sohag','Qena','Luxor',
  'Aswan','Red Sea','New Valley','Matrouh','North Sinai','South Sinai',
];

export default function RegisterPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [form, setForm] = useState({
    username: '', email: '', password: '', phone: '', governorate: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      
      if (res.ok) {
        router.push(`/auth/verify?email=${form.email}`);
      } else {
        setError(data.error || t('userExists'));
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) => setForm({ ...form, [field]: value });

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Link href="/" style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '0.15em' }}>
              <span className="text-gold">ELWAN</span>
            </Link>
          </div>

          <h1>{t('registerTitle')}</h1>
          <p>{t('registerSubtitle')}</p>

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
              <label>{t('username')} *</label>
              <input className="input" value={form.username} required
                onChange={e => update('username', e.target.value)} />
            </div>
            <div className="input-group">
              <label>{t('email')} *</label>
              <input className="input" type="email" value={form.email} required
                onChange={e => update('email', e.target.value)} />
            </div>
            <div className="input-group">
              <label>{t('password')} *</label>
              <input className="input" type="password" value={form.password} required minLength={6}
                onChange={e => update('password', e.target.value)} />
            </div>
            <div className="input-group">
              <label>{t('phone')} *</label>
              <input className="input" type="tel" value={form.phone} required
                onChange={e => update('phone', e.target.value)} />
            </div>
            <div className="input-group">
              <label>{t('governorate')} *</label>
              <select className="input" value={form.governorate} required
                onChange={e => update('governorate', e.target.value)}>
                <option value="">Select Governorate</option>
                {governorates.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <button className="btn btn-primary btn-lg w-full" type="submit" disabled={loading}>
              {loading ? '...' : t('register')}
            </button>
          </form>

          <div className="auth-footer">
            <p>{t('hasAccount')} <Link href="/auth/login">{t('signIn')}</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
