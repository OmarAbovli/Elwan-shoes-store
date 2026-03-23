import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(req: Request) {
  try {
    const { id, orderStatus } = await req.json();
    const order = await prisma.order.update({
      where: { id },
      data: { orderStatus },
    });
    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
