import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { username, email, password, phone, governorate } = await req.json();

    // Check existing
    const existing = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });

    if (existing) {
      return NextResponse.json({ error: 'Username or email already exists' }, { status: 400 });
    }

    // Generate 6-digit verification code
    const verifyToken = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        phone,
        governorate,
        verifyToken,
        verified: false,
      },
    });

    // Send verification email
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: email,
        subject: 'ELWAN — Verify Your Email',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
            <h1 style="color: #C9A96E; text-align: center; letter-spacing: 0.15em;">ELWAN</h1>
            <p style="text-align: center; color: #666;">Verify your email to complete registration</p>
            <div style="background: #1a1a2e; color: #f0ece4; text-align: center; padding: 30px; border-radius: 12px; margin: 20px 0;">
              <p style="margin-bottom: 10px; color: #a8a4b8;">Your verification code:</p>
              <h2 style="font-size: 36px; letter-spacing: 0.5em; color: #C9A96E; margin: 0;">${verifyToken}</h2>
            </div>
            <p style="text-align: center; color: #999; font-size: 12px;">This code expires in 24 hours.</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Email send error:', emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
