'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface Product {
  id: string;
  nameEn: string;
  nameAr: string;
  price: number;
  images: string[];
  category: string;
  isCustomizable: boolean;
  featured?: boolean;
}

export default function ProductCard({ product }: { product: Product }) {
  const t = useTranslations('products');
  const locale = typeof document !== 'undefined' ? document.documentElement.lang : 'en';
  const name = locale === 'ar' ? product.nameAr : product.nameEn;
  const placeholder = product.category === 'sneakers' ? '👟' : '👞';

  return (
    <Link href={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
      <div className="product-card">
        {product.isCustomizable && (
          <div className="product-card-badge">✿ Custom</div>
        )}

        <div className="product-card-image img-3d">
          {product.images && product.images.length > 0 ? (
            <img src={product.images[0]} alt={name} loading="lazy" />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, var(--color-bg-tertiary), var(--color-primary-light))',
              fontSize: '5rem',
              filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))',
            }}>
              {placeholder}
            </div>
          )}
        </div>

        <div className="product-card-body">
          <div className="product-card-name">{name}</div>
          <div className="product-card-price">
            {product.price.toLocaleString()} {t('egp')}
          </div>
          <button className="btn btn-secondary btn-sm w-full" style={{ marginTop: '0.75rem' }}>
            {t('viewProduct')}
          </button>
        </div>
      </div>
    </Link>
  );
}
