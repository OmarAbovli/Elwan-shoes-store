'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function Footer() {
  const t = useTranslations('footer');
  const tn = useTranslations('nav');

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>{t('brand')}</h3>
            <p>{t('tagline')}</p>
          </div>

          <div className="footer-col">
            <h4>{t('quickLinks')}</h4>
            <ul>
              <li><Link href="/">{tn('home')}</Link></li>
              <li><Link href="/products">{tn('products')}</Link></li>
              <li><Link href="/about">{tn('about')}</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>{t('contactUs')}</h4>
            <ul>
              <li>
                <a href="https://wa.me/201285986697" target="_blank" rel="noopener">
                  {t('whatsapp')}: +20 12 85986697
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>{t('followUs')}</h4>
            <ul>
              <li><a href="#">Instagram</a></li>
              <li><a href="#">Facebook</a></li>
              <li><a href="#">TikTok</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} ELWAN. {t('rights')}.</p>
          <p style={{ color: 'var(--color-secondary)', fontWeight: 600 }}>
            Made in Egypt 🇪🇬
          </p>
        </div>
      </div>
    </footer>
  );
}
