'use client';

import { useEffect, useState } from 'react';

interface Discount {
  id: string;
  code: string;
  percentage: number;
  maxUses: number;
  usedCount: number;
  active: boolean;
  expiresAt: string | null;
}

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: '', percentage: 10, maxUses: 100, active: true, expiresAt: '',
  });

  const fetchDiscounts = () => {
    fetch('/api/discounts').then(r => r.json()).then(d => { setDiscounts(d.codes || []); setLoading(false); });
  };

  useEffect(() => { fetchDiscounts(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/discounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      }),
    });
    setShowForm(false);
    setForm({ code: '', percentage: 10, maxUses: 100, active: true, expiresAt: '' });
    fetchDiscounts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this discount code?')) return;
    await fetch('/api/discounts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchDiscounts();
  };

  return (
    <div>
      <div className="admin-header">
        <h1>🏷️ Discount Codes</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ New Code'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="input-group">
                <label>Code *</label>
                <input className="input" required value={form.code}
                  onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                  placeholder="e.g. ELWAN20" />
              </div>
              <div className="input-group">
                <label>Discount % *</label>
                <input className="input" type="number" required min={1} max={100} value={form.percentage}
                  onChange={e => setForm({...form, percentage: Number(e.target.value)})} />
              </div>
              <div className="input-group">
                <label>Max Uses</label>
                <input className="input" type="number" value={form.maxUses}
                  onChange={e => setForm({...form, maxUses: Number(e.target.value)})} />
              </div>
              <div className="input-group">
                <label>Expires At (optional)</label>
                <input className="input" type="date" value={form.expiresAt}
                  onChange={e => setForm({...form, expiresAt: e.target.value})} />
              </div>
            </div>
            <button className="btn btn-primary" type="submit" style={{ marginTop: '1rem' }}>
              Create Discount
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading-page"><div className="spinner" /></div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Code</th><th>Discount</th><th>Usage</th>
                <th>Status</th><th>Expires</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {discounts.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                  No discount codes yet
                </td></tr>
              ) : discounts.map(d => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 700, letterSpacing: '0.05em' }}>{d.code}</td>
                  <td style={{ color: 'var(--color-secondary)', fontWeight: 600 }}>{d.percentage}%</td>
                  <td>{d.usedCount} / {d.maxUses}</td>
                  <td>
                    <span className={`badge ${d.active ? 'badge-success' : 'badge-error'}`}>
                      {d.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--color-text-muted)' }}>
                    {d.expiresAt ? new Date(d.expiresAt).toLocaleDateString() : 'Never'}
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-error)' }}
                      onClick={() => handleDelete(d.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
