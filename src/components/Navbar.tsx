'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/lib/store';

export default function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const getItemCount = useCartStore((s) => s.getItemCount);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const switchLocale = () => {
    const next = locale === 'en' ? 'ar' : 'en';
    document.cookie = `locale=${next}; path=/; max-age=31536000`;
    window.location.reload();
  };

  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner">
        <Link href="/" className="navbar-logo">
          <span>ELWAN</span>
        </Link>

        <ul className={`navbar-links ${mobileOpen ? 'mobile-open' : ''}`}>
          <li><Link href="/">{t('home')}</Link></li>
          <li><Link href="/products">{t('products')}</Link></li>
          <li><Link href="/about">{t('about')}</Link></li>
          {isAdmin && <li><Link href="/admin">{t('admin')}</Link></li>}
        </ul>

        <div className="navbar-actions">
          <button className="lang-switch" onClick={switchLocale}>
            {locale === 'en' ? 'عربي' : 'EN'}
          </button>

          <Link href="/cart" className="btn btn-ghost cart-badge">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {mounted && getItemCount() > 0 && (
              <span className="count">{getItemCount()}</span>
            )}
          </Link>

          {session ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                {session.user?.name}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={() => signOut()}>
                {t('logout')}
              </button>
            </div>
          ) : (
            <Link href="/auth/login" className="btn btn-primary btn-sm">
              {t('login')}
            </Link>
          )}

          <button 
            className="mobile-menu-btn" 
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  );
}
