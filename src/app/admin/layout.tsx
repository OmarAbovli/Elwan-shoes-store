'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

const adminLinks = [
  { href: '/admin', label: '📊 Dashboard', icon: '📊' },
  { href: '/admin/products', label: '👟 Products', icon: '👟' },
  { href: '/admin/orders', label: '📦 Orders', icon: '📦' },
  { href: '/admin/shipping', label: '🚚 Shipping', icon: '🚚' },
  { href: '/admin/discounts', label: '🏷️ Discounts', icon: '🏷️' },
  { href: '/admin/settings', label: '⚙️ Settings', icon: '⚙️' },
  { href: '/admin/whatsapp', label: '📱 WhatsApp', icon: '📱' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && (session?.user as any)?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return <div className="loading-page" style={{ minHeight: '100vh' }}><div className="spinner" /></div>;
  }

  if ((session?.user as any)?.role !== 'ADMIN') return null;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/admin" style={{
            fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.1em',
            color: 'var(--color-secondary)', textDecoration: 'none',
          }}>
            ELWAN Admin
          </Link>
        </div>
        <ul className="admin-sidebar-links">
          {adminLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={pathname === link.href ? 'active' : ''}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
      <div className="admin-content">
        {children}
      </div>
    </div>
  );
}
