'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';

interface Product {
  id: string;
  nameEn: string;
  nameAr: string;
  price: number;
  images: string[];
  category: string;
  isCustomizable: boolean;
}

export default function ProductsPage() {
  const t = useTranslations('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => { setProducts(data.products || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = products
    .filter(p => filter === 'all' || p.category === filter)
    .sort((a, b) => {
      if (sort === 'priceLow') return a.price - b.price;
      if (sort === 'priceHigh') return b.price - a.price;
      return 0; // newest — already sorted by API
    });

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>{t('title')}</h1>
          <div className="section-divider" />
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['all', 'sneakers', 'shoes'].map((cat) => (
              <button
                key={cat}
                className={`btn btn-sm ${filter === cat ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter(cat)}
              >
                {t(cat as any)}
              </button>
            ))}
          </div>

          <select
            className="input"
            style={{ width: 'auto', minWidth: '200px' }}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">{t('newest')}</option>
            <option value="priceLow">{t('priceLow')}</option>
            <option value="priceHigh">{t('priceHigh')}</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-page"><div className="spinner" /></div>
        ) : filtered.length > 0 ? (
          <div className="shelf-container">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center" style={{ padding: '6rem 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👟</div>
            <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)' }}>
              {t('noProducts')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
