import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (user.verified) return NextResponse.json({ error: 'Already verified' }, { status: 400 });
    if (user.verifyToken !== code) return NextResponse.json({ error: 'Invalid code' }, { status: 400 });

    await prisma.user.update({
      where: { email },
      data: { verified: true, verifyToken: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
