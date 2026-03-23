'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
  totalOrders: number;
  revenue: number;
  products: number;
  pendingOrders: number;
}

interface Order {
  id: string;
  customerName: string;
  total: number;
  orderStatus: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalOrders: 0, revenue: 0, products: 0, pendingOrders: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Fetch stats
    Promise.all([
      fetch('/api/orders').then(r => r.json()),
      fetch('/api/products').then(r => r.json()),
    ]).then(([ordersData, prodsData]) => {
      const orders = ordersData.orders || [];
      setStats({
        totalOrders: orders.length,
        revenue: orders.reduce((s: number, o: any) => s + o.total, 0),
        products: (prodsData.products || []).length,
        pendingOrders: orders.filter((o: any) => o.orderStatus === 'pending').length,
      });
      setRecentOrders(orders.slice(0, 10));
    });
  }, []);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'badge-warning',
      confirmed: 'badge-info',
      shipped: 'badge-info',
      delivered: 'badge-success',
      cancelled: 'badge-error',
    };
    return map[status] || 'badge-info';
  };

  return (
    <div>
      <div className="admin-header">
        <h1>Dashboard</h1>
        <Link href="/admin/products" className="btn btn-primary btn-sm">
          + Add Product
        </Link>
      </div>

      <div className="stat-grid">
        {[
          { label: 'TOTAL ORDERS', value: stats.totalOrders, icon: '📦' },
          { label: 'REVENUE', value: `${stats.revenue.toLocaleString()} EGP`, icon: '💰' },
          { label: 'PRODUCTS', value: stats.products, icon: '👟' },
          { label: 'PENDING', value: stats.pendingOrders, icon: '⏳' },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
              <span style={{ fontSize: '2rem' }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="flex-between" style={{ marginBottom: '1rem' }}>
          <h3>Recent Orders</h3>
          <Link href="/admin/orders" className="btn btn-ghost btn-sm">View All →</Link>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                    No orders yet
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 600 }}>#{order.id.slice(-6)}</td>
                    <td>{order.customerName}</td>
                    <td style={{ color: 'var(--color-secondary)', fontWeight: 600 }}>
                      {order.total.toLocaleString()} EGP
                    </td>
                    <td><span className={`badge ${statusBadge(order.orderStatus)}`}>{order.orderStatus}</span></td>
                    <td style={{ color: 'var(--color-text-muted)' }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
