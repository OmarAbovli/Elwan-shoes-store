import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const verifyToken = Math.floor(100000 + Math.random() * 900000).toString();
    await prisma.user.update({
      where: { email },
      data: { verifyToken },
    });

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: 'ELWAN — Verification Code',
      html: `
        <div style="font-family: Arial; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #C9A96E; text-align: center; letter-spacing: 0.15em;">ELWAN</h1>
          <div style="background: #1a1a2e; color: #f0ece4; text-align: center; padding: 30px; border-radius: 12px;">
            <p style="color: #a8a4b8;">Your new verification code:</p>
            <h2 style="font-size: 36px; letter-spacing: 0.5em; color: #C9A96E;">${verifyToken}</h2>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to resend' }, { status: 500 });
  }
}
