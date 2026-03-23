'use client';

import { useTranslations } from 'next-intl';

export default function AboutPage() {
  const t = useTranslations('about');

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>{t('title')}</h1>
          <div className="section-divider" />
        </div>

        {/* Story */}
        <div className="card" style={{
          maxWidth: '800px',
          margin: '0 auto 3rem',
          textAlign: 'center',
          padding: '3rem',
          background: 'linear-gradient(135deg, rgba(201, 169, 110, 0.05), rgba(212, 165, 116, 0.02))',
        }}>
          <p style={{ fontSize: '1.15rem', lineHeight: 1.8 }}>{t('story')}</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          maxWidth: '800px',
          margin: '0 auto',
        }}>
          <div className="card text-center" style={{ padding: '2.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
            <h3 style={{ marginBottom: '0.75rem' }}>{t('mission')}</h3>
            <p>{t('missionText')}</p>
          </div>
          <div className="card text-center" style={{ padding: '2.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🪡</div>
            <h3 style={{ marginBottom: '0.75rem' }}>{t('craftsmanship')}</h3>
            <p>{t('craftsmanshipText')}</p>
          </div>
        </div>

        {/* Brand Values */}
        <section className="section">
          <div className="section-header">
            <h2>Why Elwan?</h2>
            <div className="section-divider" />
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.5rem',
          }}>
            {[
              { icon: '🇪🇬', title: '100% Egyptian', desc: 'Proudly made in Egypt, supporting local artisans and craftsmanship.' },
              { icon: '✿', title: 'Unique Style', desc: 'Every pair is one-of-a-kind with hand-embroidered designs and custom options.' },
              { icon: '💎', title: 'Premium Quality', desc: 'We use only the finest materials to ensure comfort and durability.' },
            ].map(item => (
              <div key={item.title} className="card text-center" style={{ padding: '2rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{item.icon}</div>
                <h4 style={{ marginBottom: '0.5rem' }}>{item.title}</h4>
                <p style={{ fontSize: '0.9rem' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
