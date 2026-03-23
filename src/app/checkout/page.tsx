'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import { useSession } from 'next-auth/react';

interface ShippingRate {
  governorate: string;
  nameAr: string;
  cost: number;
}

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const tp = useTranslations('products');
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, getTotal, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const locale = typeof document !== 'undefined' ? document.documentElement.lang : 'en';
  const discountPercent = Number(searchParams.get('discount') || 0);
  const discountCode = searchParams.get('code') || '';

  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    altPhone: '',
    address: '',
    governorate: '',
    paymentMethod: 'cod',
  });

  useEffect(() => {
    setMounted(true);
    fetch('/api/shipping')
      .then(r => r.json())
      .then(data => setShippingRates(data.rates || []));
  }, []);

  if (!mounted) return <div className="page loading-page"><div className="spinner" /></div>;

  const subtotal = getTotal();
  const discountAmount = subtotal * (discountPercent / 100);
  const selectedRate = shippingRates.find(r => r.governorate === form.governorate);
  const shippingCost = selectedRate?.cost || 0;
  const total = subtotal - discountAmount + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName || !form.phone || !form.address || !form.governorate) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: items.map(i => ({
            productId: i.productId,
            quantity: i.quantity,
            size: i.size,
            color: i.color,
            customEmbroidery: i.customEmbroidery,
            price: i.price,
          })),
          subtotal,
          discount: discountAmount,
          shippingCost,
          total,
          discountCode: discountCode || null,
          userId: (session?.user as any)?.id || null,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        clearCart();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="page">
        <div className="container text-center" style={{ padding: '8rem 0' }}>
          <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>🎉</div>
          <h1 style={{ marginBottom: '0.75rem', color: 'var(--color-success)' }}>{t('orderSuccess')}</h1>
          <p style={{ fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
            {t('orderSuccessMsg')}
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => router.push('/')}>
            ← {locale === 'ar' ? 'رجوع للرئيسية' : 'Back to Home'}
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>{t('title')}</h1>
          <div className="section-divider" />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="checkout-layout">
            {/* Customer Info */}
            <div>
              <div className="card">
                <h3 style={{ marginBottom: '1.5rem' }}>{t('customerInfo')}</h3>
                <div className="auth-form">
                  <div className="input-group">
                    <label>{t('name')} *</label>
                    <input className="input" required value={form.customerName}
                      onChange={e => setForm({...form, customerName: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label>{t('phone')} *</label>
                    <input className="input" required type="tel" value={form.phone}
                      onChange={e => setForm({...form, phone: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label>{t('altPhone')}</label>
                    <input className="input" type="tel" value={form.altPhone}
                      onChange={e => setForm({...form, altPhone: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label>{t('address')} *</label>
                    <textarea className="input" required rows={3} value={form.address}
                      onChange={e => setForm({...form, address: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label>{t('governorate')} *</label>
                    <select className="input" required value={form.governorate}
                      onChange={e => setForm({...form, governorate: e.target.value})}>
                      <option value="">{t('selectGovernorate')}</option>
                      {shippingRates.map(r => (
                        <option key={r.governorate} value={r.governorate}>
                          {locale === 'ar' ? r.nameAr : r.governorate} — {r.cost} {tp('egp')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="card" style={{ marginTop: '1rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>{t('paymentMethod')}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    { value: 'cod', label: t('cod'), icon: '💵' },
                    { value: 'paymob', label: t('paymob'), icon: '💳' },
                  ].map(method => (
                    <label key={method.value} className="card" style={{
                      display: 'flex', alignItems: 'center', gap: '1rem',
                      cursor: 'pointer', padding: '1rem',
                      borderColor: form.paymentMethod === method.value ? 'var(--color-secondary)' : undefined,
                      background: form.paymentMethod === method.value ? 'rgba(201,169,110,0.05)' : undefined,
                    }}>
                      <input type="radio" name="payment" value={method.value}
                        checked={form.paymentMethod === method.value}
                        onChange={e => setForm({...form, paymentMethod: e.target.value})} />
                      <span style={{ fontSize: '1.5rem' }}>{method.icon}</span>
                      <span style={{ fontWeight: 500 }}>{method.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="card" style={{ position: 'sticky', top: '100px' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>{t('orderSummary')}</h3>
              
              {items.map(item => (
                <div key={`${item.productId}-${item.size}`} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)',
                }}>
                  <div>
                    <span style={{ fontWeight: 500 }}>
                      {locale === 'ar' ? item.nameAr : item.nameEn}
                    </span>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                      {' '}×{item.quantity} • {tp('size')} {item.size}
                    </span>
                  </div>
                  <span>{(item.price * item.quantity).toLocaleString()} {tp('egp')}</span>
                </div>
              ))}

              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="flex-between">
                  <span style={{ color: 'var(--color-text-secondary)' }}>{t('subtotal') as string}</span>
                  <span>{subtotal.toLocaleString()} {tp('egp')}</span>
                </div>
                {discountPercent > 0 && (
                  <div className="flex-between">
                    <span style={{ color: 'var(--color-success)' }}>Discount ({discountPercent}%)</span>
                    <span style={{ color: 'var(--color-success)' }}>-{discountAmount.toLocaleString()} {tp('egp')}</span>
                  </div>
                )}
                <div className="flex-between">
                  <span style={{ color: 'var(--color-text-secondary)' }}>{t('shippingCost')}</span>
                  <span>{shippingCost > 0 ? `${shippingCost} ${tp('egp')}` : '—'}</span>
                </div>
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  <div className="flex-between">
                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{t('total') as string}</span>
                    <span style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--color-secondary)' }}>
                      {total.toLocaleString()} {tp('egp')}
                    </span>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg w-full" style={{ marginTop: '1.5rem' }}
                disabled={loading}>
                {loading ? '...' : t('placeOrder')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
