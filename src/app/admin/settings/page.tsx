'use client';

import { useEffect, useState } from 'react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    paymobApiKey: '',
    paymobSecretKey: '',
    paymobIframeId: '',
    paymobIntegrationId: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(data => {
      if (data) setSettings({
        paymobApiKey: data.paymobApiKey || '',
        paymobSecretKey: data.paymobSecretKey || '',
        paymobIframeId: data.paymobIframeId || '',
        paymobIntegrationId: data.paymobIntegrationId || '',
      });
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <div className="admin-header">
        <h1>⚙️ Settings</h1>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Settings'}
        </button>
      </div>

      {/* Paymob Settings */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>💳 Paymob Payment Gateway</h3>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Configure your Paymob credentials to enable online card payments.
          Get your credentials from{' '}
          <a href="https://accept.paymob.com" target="_blank" rel="noopener">accept.paymob.com</a>
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="input-group">
            <label>API Key</label>
            <input className="input" type="password" value={settings.paymobApiKey}
              onChange={e => setSettings({...settings, paymobApiKey: e.target.value})}
              placeholder="Enter Paymob API Key" />
          </div>
          <div className="input-group">
            <label>Secret Key</label>
            <input className="input" type="password" value={settings.paymobSecretKey}
              onChange={e => setSettings({...settings, paymobSecretKey: e.target.value})}
              placeholder="Enter Secret Key" />
          </div>
          <div className="input-group">
            <label>iFrame ID</label>
            <input className="input" value={settings.paymobIframeId}
              onChange={e => setSettings({...settings, paymobIframeId: e.target.value})}
              placeholder="e.g. 123456" />
          </div>
          <div className="input-group">
            <label>Integration ID</label>
            <input className="input" value={settings.paymobIntegrationId}
              onChange={e => setSettings({...settings, paymobIntegrationId: e.target.value})}
              placeholder="e.g. 789012" />
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>📱 Contact Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="input-group">
            <label>Order Notifications WhatsApp</label>
            <input className="input" value="+201503860035" disabled
              style={{ opacity: 0.7 }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Set in environment variables
            </span>
          </div>
          <div className="input-group">
            <label>Customer Contact WhatsApp</label>
            <input className="input" value="+201285986697" disabled
              style={{ opacity: 0.7 }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Set in environment variables
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
