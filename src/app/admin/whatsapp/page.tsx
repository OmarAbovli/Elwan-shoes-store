'use client';

import { useEffect, useState, useRef } from 'react';

export default function AdminWhatsAppPage() {
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Poll for status updates
  const pollStatus = async () => {
    try {
      const res = await fetch('/api/whatsapp/status');
      const data = await res.json();
      
      if (data.connected) {
        setStatus('connected');
        setQrCode(null);
        stopPolling();
      } else if (data.qrCode) {
        setStatus('connecting');
        setQrCode(data.qrCode);
      }
    } catch {}
  };

  const startPolling = () => {
    stopPolling();
    pollRef.current = setInterval(pollStatus, 3000);
  };

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const connectWhatsApp = async () => {
    setLoading(true);
    setStatus('connecting');
    
    try {
      const res = await fetch('/api/whatsapp/connect', { method: 'POST' });
      const data = await res.json();
      
      if (data.connected) {
        setStatus('connected');
      } else if (data.qrCode) {
        setQrCode(data.qrCode);
        setStatus('connecting');
        startPolling();
      } else {
        // Start polling to wait for QR
        startPolling();
      }
    } catch {
      setStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  const disconnectWhatsApp = async () => {
    stopPolling();
    await fetch('/api/whatsapp/disconnect', { method: 'POST' });
    setStatus('disconnected');
    setQrCode(null);
  };

  // Check initial status
  useEffect(() => {
    pollStatus();
    return () => stopPolling();
  }, []);

  return (
    <div>
      <div className="admin-header">
        <h1>📱 WhatsApp Integration</h1>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <div style={{ textAlign: 'center' }}>
          {/* Status Indicator */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)',
            background: status === 'connected' ? 'rgba(74,222,128,0.1)' :
              status === 'connecting' ? 'rgba(251,191,36,0.1)' : 'rgba(248,113,113,0.1)',
            marginBottom: '2rem',
          }}>
            <div style={{
              width: '10px', height: '10px', borderRadius: '50%',
              background: status === 'connected' ? 'var(--color-success)' :
                status === 'connecting' ? 'var(--color-warning)' : 'var(--color-error)',
              animation: status === 'connecting' ? 'pulse 1.5s ease-in-out infinite' : 'none',
            }} />
            <span style={{
              fontWeight: 600, fontSize: '0.9rem',
              color: status === 'connected' ? 'var(--color-success)' :
                status === 'connecting' ? 'var(--color-warning)' : 'var(--color-error)',
            }}>
              {status === 'connected' ? 'Connected' :
                status === 'connecting' ? 'Waiting for QR Scan...' : 'Disconnected'}
            </span>
          </div>

          {/* Disconnected State */}
          {status === 'disconnected' && (
            <>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
                Connect your WhatsApp to receive order notifications and manage products via chat commands.
              </p>
              <button className="btn btn-primary btn-lg" onClick={connectWhatsApp} disabled={loading}>
                {loading ? 'Initializing...' : 'Connect WhatsApp'}
              </button>
            </>
          )}

          {/* Connecting State — Show QR */}
          {status === 'connecting' && (
            <>
              {qrCode ? (
                <>
                  <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                    Scan this QR code with WhatsApp on your phone:
                  </p>
                  <div style={{
                    display: 'inline-block', padding: '1.5rem',
                    background: '#fff', borderRadius: 'var(--radius-lg)',
                    marginBottom: '1.5rem',
                    boxShadow: '0 8px 32px rgba(201, 169, 110, 0.15)',
                  }}>
                    <img src={qrCode} alt="WhatsApp QR Code" style={{ width: '256px', height: '256px' }} />
                  </div>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    📱 Open WhatsApp → <strong>Settings</strong> → <strong>Linked Devices</strong> → <strong>Link a Device</strong>
                  </p>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                    QR code refreshes automatically. Page will update when connected.
                  </p>
                </>
              ) : (
                <>
                  <div className="spinner" style={{ margin: '2rem auto' }} />
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    Generating QR code...
                  </p>
                </>
              )}
              <button className="btn btn-ghost" style={{ marginTop: '1rem' }} onClick={disconnectWhatsApp}>
                Cancel
              </button>
            </>
          )}

          {/* Connected State */}
          {status === 'connected' && (
            <>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
              <p style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                WhatsApp is connected!
              </p>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
                Order notifications will be sent automatically. You can also manage your store via chat commands.
              </p>
              <button className="btn btn-secondary" onClick={disconnectWhatsApp}>
                Disconnect WhatsApp
              </button>
            </>
          )}
        </div>
      </div>

      {/* Commands Reference */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>📋 Available Bot Commands</h3>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Send these commands to your linked WhatsApp to manage the store:
        </p>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Command</th><th>Description</th></tr>
            </thead>
            <tbody>
              {[
                ['/help', 'Show all available commands'],
                ['/get all', 'List all products with IDs'],
                ['/get orders', 'List 10 most recent orders'],
                ['/get stats', 'View sales statistics & revenue'],
                ['/add', 'Instructions for adding a new product'],
                ['/edit <id>', 'Show product details for editing'],
                ['/delete <id>', 'Delete a product permanently'],
                ['/order <id>', 'View full order details'],
                ['/status <order_id> <status>', 'Update order status (pending/confirmed/shipped/delivered/cancelled)'],
                ['/discount add <code> <percent>', 'Create a new discount code'],
                ['/stock <id> on/off', 'Toggle product stock status'],
              ].map(([cmd, desc]) => (
                <tr key={cmd}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--color-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>{cmd}</td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
