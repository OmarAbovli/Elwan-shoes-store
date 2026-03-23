import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    const discount = await prisma.discountCode.findUnique({ where: { code } });

    if (!discount || !discount.active) {
      return NextResponse.json({ valid: false });
    }

    if (discount.expiresAt && new Date() > discount.expiresAt) {
      return NextResponse.json({ valid: false });
    }

    if (discount.usedCount >= discount.maxUses) {
      return NextResponse.json({ valid: false });
    }

    // Increment usage
    await prisma.discountCode.update({
      where: { code },
      data: { usedCount: { increment: 1 } },
    });

    return NextResponse.json({
      valid: true,
      percentage: discount.percentage,
    });
  } catch {
    return NextResponse.json({ valid: false });
  }
}
