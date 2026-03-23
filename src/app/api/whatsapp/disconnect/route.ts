import { NextResponse } from 'next/server';
import { disconnectWhatsApp } from '@/lib/whatsapp';

export async function POST() {
  try {
    await disconnectWhatsApp();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Disconnect failed' }, { status: 500 });
  }
}
