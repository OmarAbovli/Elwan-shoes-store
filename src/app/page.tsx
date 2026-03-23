'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';

interface Product {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  price: number;
  images: string[];
  category: string;
  isCustomizable: boolean;
  featured: boolean;
}

export default function HomePage() {
  const t = useTranslations('hero');
  const tp = useTranslations('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products?featured=true')
      .then(r => r.json())
      .then(data => { setProducts(data.products || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <div className="hero-text">
            <h1>{t('title')}</h1>
            <p>{t('subtitle')}</p>
            <div className="hero-actions">
              <Link href="/products" className="btn btn-primary btn-lg">
                {t('cta')}
              </Link>
              <Link href="/products?custom=true" className="btn btn-outline btn-lg">
                {t('customCta')}
              </Link>
            </div>

            {/* Brand Features */}
            <div style={{ display: 'flex', gap: '2rem', marginTop: '3rem', flexWrap: 'wrap' }}>
              {[
                { icon: '✦', label: 'Handcrafted', labelAr: 'صناعة يدوية' },
                { icon: '🇪🇬', label: 'Made in Egypt', labelAr: 'صنع في مصر' },
                { icon: '✿', label: 'Custom Embroidery', labelAr: 'تطريز مخصص' },
              ].map((f) => (
                <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>{f.icon}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    {f.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-shoe-container">
              {/* Decorative shoe placeholder with 3D effect */}
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12rem',
                filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))',
                transform: 'rotateY(-15deg)',
              }}>
                👟
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'floatShoe 3s ease-in-out infinite',
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}>
            SCROLL
          </span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2">
            <path d="M12 5v14M19 12l-7 7-7-7"/>
          </svg>
        </div>
      </section>

      {/* Featured Products — Shelf Display */}
      <section className="section" style={{ background: 'var(--color-bg-secondary)' }}>
        <div className="container">
          <div className="section-header">
            <h2>{tp('featured')}</h2>
            <div className="section-divider" />
            <p>{tp('title')}</p>
          </div>

          {loading ? (
            <div className="loading-page"><div className="spinner" /></div>
          ) : products.length > 0 ? (
            <div className="shelf-container">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center" style={{ padding: '4rem 0' }}>
              <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)' }}>
                {tp('noProducts')}
              </p>
              <p style={{ marginTop: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                Products coming soon — check back later!
              </p>
            </div>
          )}

          <div className="text-center mt-3">
            <Link href="/products" className="btn btn-outline">
              {t('cta')} →
            </Link>
          </div>
        </div>
      </section>

      {/* Custom Embroidery CTA */}
      <section className="section">
        <div className="container">
          <div className="card" style={{
            background: 'linear-gradient(135deg, rgba(201, 169, 110, 0.1), rgba(212, 165, 116, 0.05))',
            border: '1px solid rgba(201, 169, 110, 0.2)',
            padding: '4rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-30%',
              width: '60%',
              height: '200%',
              background: 'radial-gradient(ellipse, rgba(201, 169, 110, 0.08), transparent)',
              pointerEvents: 'none',
            }} />
            <h2 style={{ position: 'relative', zIndex: 1, marginBottom: '1rem' }}>
              ✿ Custom Embroidery
            </h2>
            <p style={{
              position: 'relative',
              zIndex: 1,
              maxWidth: '600px',
              margin: '0 auto 2rem',
              fontSize: '1.1rem',
            }}>
              Choose any sneaker or shoe from our collection and personalize it with your own embroidered
              text, logo, or design. Make it truly yours.
            </p>
            <Link href="/products" className="btn btn-primary btn-lg" style={{ position: 'relative', zIndex: 1 }}>
              Start Designing →
            </Link>
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="section" style={{ background: 'var(--color-bg-secondary)' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2rem',
          }}>
            {[
              { icon: '🪡', title: 'Handcrafted', desc: 'Every pair is hand-embroidered by skilled Egyptian artisans with years of experience.' },
              { icon: '🎨', title: 'Customizable', desc: 'Choose your text, logo, or pattern. We bring your vision to life on premium footwear.' },
              { icon: '📦', title: 'Nationwide Delivery', desc: 'We deliver to all 27 Egyptian governorates with tracking and cash on delivery.' },
            ].map((item) => (
              <div key={item.title} className="card text-center" style={{ padding: '2.5rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{item.icon}</div>
                <h3 style={{ marginBottom: '0.75rem' }}>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
