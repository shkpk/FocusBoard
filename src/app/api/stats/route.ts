import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [totalTasks, completedTasks, inProgressTasks, todoTasks, focusToday, focusWeek, allSessions] = await Promise.all([
      prisma.task.count({ where: { userId: user.id } }),
      prisma.task.count({ where: { userId: user.id, status: 'done' } }),
      prisma.task.count({ where: { userId: user.id, status: 'in_progress' } }),
      prisma.task.count({ where: { userId: user.id, status: 'todo' } }),
      prisma.focusSession.findMany({
        where: { userId: user.id, type: 'focus', completed: true, startedAt: { gte: startOfDay } },
      }),
      prisma.focusSession.findMany({
        where: { userId: user.id, type: 'focus', completed: true, startedAt: { gte: startOfWeek } },
      }),
      prisma.focusSession.findMany({
        where: { userId: user.id, type: 'focus', completed: true },
        orderBy: { startedAt: 'desc' },
        take: 30,
      }),
    ]);

    const focusMinutesToday = focusToday.reduce((acc, s) => acc + s.duration, 0);
    const focusMinutesWeek = focusWeek.reduce((acc, s) => acc + s.duration, 0);

    // Calculate streak
    let streak = 0;
    const daySet = new Set<string>();
    allSessions.forEach(s => {
      const d = new Date(s.startedAt).toISOString().split('T')[0];
      daySet.add(d);
    });

    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      if (daySet.has(key)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    // Weekly focus data for chart
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      const minutes = allSessions
        .filter(s => new Date(s.startedAt) >= dayStart && new Date(s.startedAt) < dayEnd)
        .reduce((acc, s) => acc + s.duration, 0);
      weeklyData.push({ day: dayLabel, minutes });
    }

    return NextResponse.json({
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      focusMinutesToday,
      focusMinutesWeek,
      streak,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      weeklyData,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
