'use client';

import { useEffect, useState } from 'react';

interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  governorate: string;
  total: number;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  items: any[];
}

const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const fetchOrders = () => {
    fetch('/api/orders').then(r => r.json()).then(d => { setOrders(d.orders || []); setLoading(false); });
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (orderId: string, status: string) => {
    await fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId, orderStatus: status }),
    });
    fetchOrders();
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.orderStatus === filter);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'badge-warning', confirmed: 'badge-info',
      shipped: 'badge-info', delivered: 'badge-success', cancelled: 'badge-error',
    };
    return map[status] || 'badge-info';
  };

  return (
    <div>
      <div className="admin-header">
        <h1>Orders ({orders.length})</h1>
      </div>

      {/* Status Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['all', ...statuses].map(s => (
          <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
            {s !== 'all' && ` (${orders.filter(o => o.orderStatus === s).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-page"><div className="spinner" /></div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order</th><th>Customer</th><th>Phone</th>
                <th>Governorate</th><th>Total</th><th>Payment</th>
                <th>Status</th><th>Date</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 600 }}>#{order.id.slice(-6)}</td>
                  <td>{order.customerName}</td>
                  <td><a href={`tel:${order.phone}`}>{order.phone}</a></td>
                  <td>{order.governorate}</td>
                  <td style={{ color: 'var(--color-secondary)', fontWeight: 600 }}>
                    {order.total.toLocaleString()} EGP
                  </td>
                  <td>
                    <span className={`badge ${order.paymentMethod === 'cod' ? 'badge-warning' : 'badge-info'}`}>
                      {order.paymentMethod === 'cod' ? 'COD' : 'Card'}
                    </span>
                  </td>
                  <td>
                    <select
                      className="input"
                      value={order.orderStatus}
                      onChange={e => updateStatus(order.id, e.target.value)}
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', width: 'auto', minWidth: '120px' }}
                    >
                      {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm"
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                      {expandedOrder === order.id ? 'Close' : 'Details'}
                    </button>
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
