import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json(null);

  const user = await prisma.user.findUnique({
    where: { username: session.user.name! },
    select: { id: true, username: true, email: true, role: true, phone: true, governorate: true },
  });

  return NextResponse.json(user);
}
