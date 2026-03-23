import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const codes = await prisma.discountCode.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ codes });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const code = await prisma.discountCode.create({ data: body });
    return NextResponse.json(code, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create discount' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.discountCode.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
