import { NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export async function POST(req: Request) {
  try {
    const { to, message } = await req.json();
    
    const sent = await sendWhatsAppMessage(to, message);
    
    if (sent) {
      return NextResponse.json({ success: true });
    } else {
      // Fallback: generate WhatsApp link
      const cleanNumber = to?.replace(/[^0-9]/g, '') || '';
      const encodedMsg = encodeURIComponent(message);
      return NextResponse.json({ 
        success: false, 
        fallbackUrl: `https://wa.me/${cleanNumber}?text=${encodedMsg}` 
      });
    }
  } catch {
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }
}
