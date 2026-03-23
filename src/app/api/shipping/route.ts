import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const rates = await prisma.shippingRate.findMany({
    orderBy: { governorate: 'asc' },
  });
  return NextResponse.json({ rates });
}

export async function PUT(req: Request) {
  try {
    const { rates } = await req.json();
    for (const rate of rates) {
      await prisma.shippingRate.update({
        where: { governorate: rate.governorate },
        data: { cost: rate.cost },
      });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
