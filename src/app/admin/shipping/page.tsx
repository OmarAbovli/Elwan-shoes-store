'use client';

import { useEffect, useState } from 'react';

interface ShippingRate {
  id: string;
  governorate: string;
  nameAr: string;
  cost: number;
}

export default function AdminShippingPage() {
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/shipping').then(r => r.json()).then(d => { setRates(d.rates || []); setLoading(false); });
  }, []);

  const updateCost = (gov: string, cost: number) => {
    setRates(rates.map(r => r.governorate === gov ? { ...r, cost } : r));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/shipping', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rates: rates.map(r => ({ governorate: r.governorate, cost: r.cost })) }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <div className="admin-header">
        <h1>🚚 Shipping Rates</h1>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>

      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
        Set shipping cost (EGP) for each Egyptian governorate. These costs are automatically applied at checkout.
      </p>

      {loading ? (
        <div className="loading-page"><div className="spinner" /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.75rem' }}>
          {rates.map(rate => (
            <div key={rate.governorate} className="card" style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '1rem 1.25rem',
            }}>
              <div>
                <span style={{ fontWeight: 600 }}>{rate.governorate}</span>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                  {rate.nameAr}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  className="input"
                  type="number"
                  value={rate.cost}
                  onChange={e => updateCost(rate.governorate, Number(e.target.value))}
                  style={{ width: '80px', textAlign: 'center', padding: '0.4rem' }}
                  min={0}
                />
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>EGP</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
