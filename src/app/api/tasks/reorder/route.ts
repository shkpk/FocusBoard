import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { tasks } = await req.json() as {
      tasks: Array<{ id: string; order: number; status?: string }>;
    };

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Use a transaction for batch updates
    await prisma.$transaction(
      tasks.map(task =>
        prisma.task.updateMany({
          where: { id: task.id, userId: user.id },
          data: {
            order: task.order,
            ...(task.status !== undefined && { status: task.status }),
          },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reorder error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}