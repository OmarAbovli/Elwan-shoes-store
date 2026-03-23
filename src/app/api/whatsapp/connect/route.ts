import { NextResponse } from 'next/server';
import { startWhatsAppConnection } from '@/lib/whatsapp';

export async function POST() {
  try {
    const result = startWhatsAppConnection();
    return NextResponse.json(result);
  } catch (error) {
    console.error('WhatsApp connect error:', error);
    return NextResponse.json({ error: 'Connection failed', status: 'error' }, { status: 500 });
  }
}
