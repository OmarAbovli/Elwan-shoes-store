'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store';

interface Product {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  price: number;
  sizes: number[];
  colors: string[];
  images: string[];
  modelUrl: string | null;
  category: string;
  isCustomizable: boolean;
  inStock: boolean;
}

export default function ProductDetailPage() {
  const t = useTranslations('products');
  const params = useParams();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [customText, setCustomText] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);

  const locale = typeof document !== 'undefined' ? document.documentElement.lang : 'en';

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then(r => r.json())
      .then(data => {
        setProduct(data);
        if (data.colors?.length) setSelectedColor(data.colors[0]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="page loading-page"><div className="spinner" /></div>;
  if (!product) return <div className="page text-center" style={{ padding: '10rem 0' }}><h2>Product not found</h2></div>;

  const name = locale === 'ar' ? product.nameAr : product.nameEn;
  const desc = locale === 'ar' ? product.descriptionAr : product.descriptionEn;
  const placeholder = product.category === 'sneakers' ? '👟' : '👞';

  const handleAddToCart = () => {
    if (!selectedSize) return alert(t('selectSize'));
    addItem({
      productId: product.id,
      nameEn: product.nameEn,
      nameAr: product.nameAr,
      price: product.price,
      size: selectedSize,
      color: selectedColor,
      quantity: 1,
      image: product.images?.[0] || '',
      customEmbroidery: customText || undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/cart');
  };

  return (
    <div className="page">
      <div className="container">
        <button className="btn btn-ghost" onClick={() => router.back()} style={{ marginBottom: '1.5rem' }}>
          ← {locale === 'ar' ? 'رجوع' : 'Back'}
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem', alignItems: 'start' }}>
          {/* Image Gallery */}
          <div>
            <div className="img-3d" style={{
              aspectRatio: '1',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, var(--color-bg-tertiary), var(--color-primary-light))',
              marginBottom: '1rem',
            }}>
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[selectedImage]}
                  alt={name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '100%', height: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10rem',
                  filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.4))',
                }}>
                  {placeholder}
                </div>
              )}
            </div>

            {product.images && product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
                {product.images.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    style={{
                      width: '80px', height: '80px', borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden', cursor: 'pointer', flexShrink: 0,
                      border: i === selectedImage ? '2px solid var(--color-secondary)' : '2px solid transparent',
                      opacity: i === selectedImage ? 1 : 0.6,
                      transition: 'all 200ms ease',
                    }}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className={`badge ${product.inStock ? 'badge-success' : 'badge-error'}`}>
                {product.inStock ? t('inStock') : t('outOfStock')}
              </span>
              {product.isCustomizable && (
                <span className="badge badge-info">✿ {t('customEmbroidery')}</span>
              )}
            </div>

            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{name}</h1>
            <div style={{
              fontSize: '2rem', fontWeight: 800, color: 'var(--color-secondary)',
              marginBottom: '1.5rem',
            }}>
              {product.price.toLocaleString()} {t('egp')}
            </div>

            <p style={{ marginBottom: '2rem', lineHeight: 1.8 }}>{desc}</p>

            {/* Size Selector */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: 600, marginBottom: '0.75rem', display: 'block' }}>
                {t('size')}
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className={`btn btn-sm ${selectedSize === size ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setSelectedSize(size)}
                    style={{ minWidth: '50px' }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selector */}
            {product.colors.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontWeight: 600, marginBottom: '0.75rem', display: 'block' }}>
                  {t('color')}
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: color,
                        border: selectedColor === color
                          ? '3px solid var(--color-secondary)'
                          : '3px solid var(--border-color)',
                        cursor: 'pointer',
                        transition: 'all 200ms ease',
                        boxShadow: selectedColor === color ? 'var(--shadow-gold)' : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Custom Embroidery */}
            {product.isCustomizable && (
              <div style={{ marginBottom: '2rem' }}>
                <button
                  className="btn btn-outline w-full"
                  onClick={() => setShowCustomModal(true)}
                >
                  ✿ {t('requestCustom')}
                </button>
                {customText && (
                  <div style={{
                    marginTop: '0.75rem', padding: '0.75rem 1rem',
                    background: 'rgba(201, 169, 110, 0.1)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(201, 169, 110, 0.2)',
                    fontSize: '0.9rem',
                  }}>
                    ✿ Embroidery: <strong>{customText}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Add to Cart / Buy Now */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                className="btn btn-secondary btn-lg"
                onClick={handleAddToCart}
                disabled={!product.inStock}
                style={{ flex: 1 }}
              >
                {added ? '✓ Added!' : t('addToCart')}
              </button>
              <button
                className="btn btn-primary btn-lg"
                onClick={handleBuyNow}
                disabled={!product.inStock}
                style={{ flex: 1 }}
              >
                {t('buyNow')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Embroidery Modal */}
      {showCustomModal && (
        <div className="modal-overlay" onClick={() => setShowCustomModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✿ {t('requestCustom')}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowCustomModal(false)}>✕</button>
            </div>
            <div>
              <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
                Describe the text, name, logo, or design you want embroidered on your {product.category === 'sneakers' ? 'sneaker' : 'shoe'}.
              </p>
              <textarea
                className="input"
                placeholder={t('customPlaceholder')}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                rows={4}
              />
              <button
                className="btn btn-primary w-full"
                style={{ marginTop: '1rem' }}
                onClick={() => setShowCustomModal(false)}
              >
                {customText ? 'Save Design Request' : 'Skip for Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
