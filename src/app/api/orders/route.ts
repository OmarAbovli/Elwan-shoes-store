import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { notifyAdminsNewOrder } from '@/lib/whatsapp';

export async function GET() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { items: { include: { product: true } }, user: true },
  });
  return NextResponse.json({ orders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, ...orderData } = body;

    const order = await prisma.order.create({
      data: {
        ...orderData,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
            color: item.color || null,
            customEmbroidery: item.customEmbroidery || null,
            price: item.price,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    // Send WhatsApp notification to all registered Admins (background)
    notifyAdminsNewOrder(order.id).catch(err => console.error('Notify admins error:', err));

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, orderStatus, paymentStatus } = await req.json();
    const data: any = {};
    if (orderStatus) data.orderStatus = orderStatus;
    if (paymentStatus) data.paymentStatus = paymentStatus;
    
    const order = await prisma.order.update({
      where: { id },
      data,
    });
    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
