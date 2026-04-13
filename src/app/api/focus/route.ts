import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const sessions = await prisma.focusSession.findMany({
      where: { userId: user.id },
      orderBy: { startedAt: 'desc' },
      take: 100,
    });

    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const focusSession = await prisma.focusSession.create({
      data: {
        duration: body.duration || 25,
        type: body.type || 'focus',
        completed: body.completed ?? true,
        startedAt: body.startedAt ? new Date(body.startedAt) : new Date(),
        completedAt: new Date(),
        userId: user.id,
      },
    });

    return NextResponse.json(focusSession, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
