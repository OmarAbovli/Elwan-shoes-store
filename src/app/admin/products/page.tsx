'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  nameEn: string;
  nameAr: string;
  price: number;
  category: string;
  inStock: boolean;
  featured: boolean;
  images: string[];
  sizes: number[];
  colors: string[];
  descriptionEn: string;
  descriptionAr: string;
  isCustomizable: boolean;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({
    nameEn: '', nameAr: '', descriptionEn: '', descriptionAr: '',
    price: 0, category: 'sneakers', isCustomizable: true,
    inStock: true, featured: false,
    sizes: [38,39,40,41,42,43,44,45],
    colors: ['#1a1a2e'],
    images: [] as string[],
  });
  const [uploading, setUploading] = useState(false);

  const fetchProducts = () => {
    fetch('/api/products').then(r => r.json()).then(d => { setProducts(d.products || []); setLoading(false); });
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/products/${editing.id}` : '/api/products';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setEditing(null);
    setForm({ nameEn: '', nameAr: '', descriptionEn: '', descriptionAr: '', price: 0,
      category: 'sneakers', isCustomizable: true, inStock: true, featured: false,
      sizes: [38,39,40,41,42,43,44,45], colors: ['#1a1a2e'], images: [] });
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    fetchProducts();
  };

  const handleEdit = (p: Product) => {
    setEditing(p);
    setForm({
      nameEn: p.nameEn, nameAr: p.nameAr,
      descriptionEn: p.descriptionEn, descriptionAr: p.descriptionAr,
      price: p.price, category: p.category, isCustomizable: p.isCustomizable,
      inStock: p.inStock, featured: p.featured,
      sizes: p.sizes, colors: p.colors, images: p.images,
    });
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    const urls: string[] = [...form.images];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) urls.push(data.url);
    }
    setForm({ ...form, images: urls });
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== index) });
  };

  return (
    <div>
      <div className="admin-header">
        <h1>Products</h1>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(!showForm); }}>
          {showForm ? '✕ Cancel' : '+ Add Product'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>{editing ? 'Edit Product' : 'New Product'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label>Name (English) *</label>
                <input className="input" required value={form.nameEn}
                  onChange={e => setForm({...form, nameEn: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Name (Arabic) *</label>
                <input className="input" required value={form.nameAr}
                  onChange={e => setForm({...form, nameAr: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Description (English) *</label>
                <textarea className="input" required rows={3} value={form.descriptionEn}
                  onChange={e => setForm({...form, descriptionEn: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Description (Arabic) *</label>
                <textarea className="input" required rows={3} value={form.descriptionAr}
                  onChange={e => setForm({...form, descriptionAr: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Price (EGP) *</label>
                <input className="input" type="number" required value={form.price}
                  onChange={e => setForm({...form, price: Number(e.target.value)})} />
              </div>
              <div className="input-group">
                <label>Category *</label>
                <select className="input" value={form.category}
                  onChange={e => setForm({...form, category: e.target.value})}>
                  <option value="sneakers">Sneakers</option>
                  <option value="shoes">Shoes</option>
                </select>
              </div>
            </div>

            {/* Images */}
            <div className="input-group" style={{ marginTop: '1rem' }}>
              <label>Product Images</label>
              <input type="file" accept="image/*" multiple onChange={handleImageUpload}
                style={{ color: 'var(--color-text-secondary)' }} />
              {uploading && <p style={{ color: 'var(--color-secondary)' }}>Uploading...</p>}
              {form.images.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  {form.images.map((img, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img src={img} alt="" style={{
                        width: '80px', height: '80px', objectFit: 'cover',
                        borderRadius: 'var(--radius-sm)',
                      }} />
                      <button type="button" onClick={() => removeImage(i)} style={{
                        position: 'absolute', top: '-8px', right: '-8px',
                        background: 'var(--color-error)', color: '#fff', border: 'none',
                        borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '10px',
                      }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Toggles */}
            <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
              {[
                { key: 'isCustomizable', label: 'Customizable' },
                { key: 'inStock', label: 'In Stock' },
                { key: 'featured', label: 'Featured' },
              ].map(toggle => (
                <label key={toggle.key} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                }}>
                  <input type="checkbox" checked={(form as any)[toggle.key]}
                    onChange={e => setForm({...form, [toggle.key]: e.target.checked})} />
                  {toggle.label}
                </label>
              ))}
            </div>

            <button className="btn btn-primary" type="submit" style={{ marginTop: '1.5rem' }}>
              {editing ? 'Update Product' : 'Create Product'}
            </button>
          </form>
        </div>
      )}

      {/* Products Table */}
      {loading ? (
        <div className="loading-page"><div className="spinner" /></div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '45px', height: '45px', borderRadius: 'var(--radius-sm)',
                        background: 'var(--color-bg-tertiary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden', flexShrink: 0,
                      }}>
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span>👟</span>
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.nameEn}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{p.nameAr}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--color-secondary)', fontWeight: 600 }}>
                    {p.price.toLocaleString()} EGP
                  </td>
                  <td><span className="badge badge-info">{p.category}</span></td>
                  <td><span className={`badge ${p.inStock ? 'badge-success' : 'badge-error'}`}>
                    {p.inStock ? 'Yes' : 'No'}
                  </span></td>
                  <td>{p.featured ? '⭐' : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(p)}>Edit</button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-error)' }}
                        onClick={() => handleDelete(p.id)}>Delete</button>
                    </div>
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
