import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 'main' } });
  return NextResponse.json(settings);
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const settings = await prisma.siteSettings.update({
      where: { id: 'main' },
      data: body,
    });
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
