import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { getMessages } from 'next-intl/server';
import Providers from './providers';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'ELWAN — Egyptian Embroidered Footwear',
  description: 'Handcrafted Egyptian sneakers & shoes with custom embroidery. Every pair tells your story. Shop unique embroidered footwear made in Egypt.',
  keywords: 'elwan, egyptian shoes, embroidered sneakers, custom footwear, handmade shoes, egypt',
  openGraph: {
    title: 'ELWAN — Egyptian Embroidered Footwear',
    description: 'Handcrafted Egyptian sneakers & shoes with custom embroidery.',
    type: 'website',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const locale = (await cookieStore).get('locale')?.value || 'en';
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body>
        <Providers locale={locale} messages={messages}>
          <div className="grain-overlay" />
          <Navbar />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
