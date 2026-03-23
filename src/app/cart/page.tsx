'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function CartPage() {
  const t = useTranslations('cart');
  const tp = useTranslations('products');
  const router = useRouter();
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [discountMsg, setDiscountMsg] = useState('');

  useEffect(() => { setMounted(true); }, []);
  
  const locale = typeof document !== 'undefined' ? document.documentElement.lang : 'en';

  const applyDiscount = async () => {
    try {
      const res = await fetch('/api/discounts/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode }),
      });
      const data = await res.json();
      if (data.valid) {
        setDiscount(data.percentage);
        setDiscountMsg(t('codeApplied'));
      } else {
        setDiscount(0);
        setDiscountMsg(t('invalidCode'));
      }
    } catch {
      setDiscountMsg(t('invalidCode'));
    }
  };

  if (!mounted) return <div className="page loading-page"><div className="spinner" /></div>;

  const subtotal = getTotal();
  const discountAmount = subtotal * (discount / 100);

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>{t('title')}</h1>
          <div className="section-divider" />
        </div>

        {items.length === 0 ? (
          <div className="text-center" style={{ padding: '6rem 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
            <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
              {t('empty')}
            </p>
            <Link href="/products" className="btn btn-primary">
              {t('continueShopping')}
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem', alignItems: 'start' }}>
            {/* Cart Items */}
            <div>
              {items.map((item) => {
                const name = locale === 'ar' ? item.nameAr : item.nameEn;
                return (
                  <div key={`${item.productId}-${item.size}`} className="card" style={{
                    display: 'flex', gap: '1.5rem', padding: '1.5rem', marginBottom: '1rem',
                  }}>
                    <div style={{
                      width: '100px', height: '100px', borderRadius: 'var(--radius-md)',
                      background: 'var(--color-bg-tertiary)', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden',
                    }}>
                      {item.image ? (
                        <img src={item.image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '3rem' }}>👟</span>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <h4 style={{ marginBottom: '0.25rem' }}>{name}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        {tp('size')}: {item.size}
                        {item.color && ` • ${tp('color')}: `}
                        {item.color && (
                          <span style={{
                            display: 'inline-block', width: '14px', height: '14px',
                            borderRadius: '50%', background: item.color,
                            verticalAlign: 'middle', marginLeft: '4px',
                          }} />
                        )}
                      </p>
                      {item.customEmbroidery && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-secondary)', marginTop: '0.25rem' }}>
                          ✿ {item.customEmbroidery}
                        </p>
                      )}

                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', marginTop: '0.75rem',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            className="btn btn-secondary btn-sm btn-icon"
                            style={{ width: '32px', height: '32px' }}
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                          >−</button>
                          <span style={{ fontWeight: 600, minWidth: '24px', textAlign: 'center' }}>
                            {item.quantity}
                          </span>
                          <button
                            className="btn btn-secondary btn-sm btn-icon"
                            style={{ width: '32px', height: '32px' }}
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                          >+</button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ fontWeight: 700, color: 'var(--color-secondary)' }}>
                            {(item.price * item.quantity).toLocaleString()} {tp('egp')}
                          </span>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--color-error)' }}
                            onClick={() => removeItem(item.productId, item.size)}
                          >
                            {t('remove')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="card" style={{ position: 'sticky', top: '100px' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>{t('title')}</h3>

              {/* Discount Code */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <input
                  className="input"
                  placeholder={t('discountCode')}
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                />
                <button className="btn btn-secondary btn-sm" onClick={applyDiscount}>
                  {t('apply')}
                </button>
              </div>
              {discountMsg && (
                <p style={{
                  fontSize: '0.85rem', marginBottom: '1rem',
                  color: discount > 0 ? 'var(--color-success)' : 'var(--color-error)',
                }}>
                  {discountMsg}
                </p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div className="flex-between">
                  <span style={{ color: 'var(--color-text-secondary)' }}>{t('subtotal')}</span>
                  <span>{subtotal.toLocaleString()} {tp('egp')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex-between">
                    <span style={{ color: 'var(--color-success)' }}>{t('discount')} ({discount}%)</span>
                    <span style={{ color: 'var(--color-success)' }}>-{discountAmount.toLocaleString()} {tp('egp')}</span>
                  </div>
                )}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  <div className="flex-between">
                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{t('total')}</span>
                    <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-secondary)' }}>
                      {(subtotal - discountAmount).toLocaleString()} {tp('egp')}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                    + {t('shipping')}
                  </p>
                </div>
              </div>

              <button
                className="btn btn-primary btn-lg w-full"
                onClick={() => router.push(`/checkout?discount=${discount}&code=${discountCode}`)}
              >
                {t('checkout')} →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
