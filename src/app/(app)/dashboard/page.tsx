'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2, Clock, Flame, Target, TrendingUp, Zap, Calendar, ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Stats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  focusMinutesToday: number;
  focusMinutesWeek: number;
  streak: number;
  completionRate: number;
  weeklyData: { day: string; minutes: number }[];
}

interface Task {
  id: string;
  title: string;
  priority: string;
  status: string;
  dueDate: string | null;
  tags: string[];
}

export default function DashboardPage() {
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([
      fetch('/api/stats').then(r => r.json()),
      fetch('/api/tasks').then(r => r.json()),
    ]).then(([s, t]) => {
      setStats(s);
      setTasks(t);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}><CardContent className="p-6"><div className="h-24 animate-pulse bg-muted rounded" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  const todayTasks = tasks.filter(t => {
    if (!t.dueDate) return false;
    const d = new Date(t.dueDate);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  const upcomingTasks = tasks.filter(t => {
    if (!t.dueDate) return false;
    return new Date(t.dueDate) > new Date() && t.status !== 'done' && t.status !== 'closed';
  }).slice(0, 5);

  const recentCompleted = tasks.filter(t => t.status === 'done' || t.status === 'closed').slice(0, 5);

  const priorityColor = (p: string) => {
    switch (p) {
      case 'urgent': return 'destructive';
      case 'high': return 'warning';
      case 'medium': return 'info';
      default: return 'secondary';
    }
  };

  const maxWeeklyMinutes = Math.max(...(stats?.weeklyData?.map(d => d.minutes) || [1]), 1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's your productivity overview.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 -mr-6 -mt-6 rounded-full bg-primary/10" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold mt-1">{stats?.completedTasks || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">of {stats?.totalTasks || 0} tasks</p>
              </div>
              <div className="rounded-xl bg-emerald-100 p-3 dark:bg-emerald-900/30">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <Progress value={stats?.completionRate || 0} className="mt-4" indicatorClassName="bg-emerald-500" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 -mr-6 -mt-6 rounded-full bg-blue-500/10" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Focus Today</p>
                <p className="text-3xl font-bold mt-1">{stats?.focusMinutesToday || 0}<span className="text-lg font-normal text-muted-foreground">m</span></p>
                <p className="text-xs text-muted-foreground mt-1">{Math.round((stats?.focusMinutesToday || 0) / 60 * 10) / 10} hours</p>
              </div>
              <div className="rounded-xl bg-blue-100 p-3 dark:bg-blue-900/30">
                <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 -mr-6 -mt-6 rounded-full bg-amber-500/10" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Weekly Focus</p>
                <p className="text-3xl font-bold mt-1">{stats?.focusMinutesWeek || 0}<span className="text-lg font-normal text-muted-foreground">m</span></p>
                <p className="text-xs text-muted-foreground mt-1">{Math.round((stats?.focusMinutesWeek || 0) / 60 * 10) / 10} hours this week</p>
              </div>
              <div className="rounded-xl bg-amber-100 p-3 dark:bg-amber-900/30">
                <TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 -mr-6 -mt-6 rounded-full bg-orange-500/10" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Streak</p>
                <p className="text-3xl font-bold mt-1">{stats?.streak || 0}<span className="text-lg font-normal text-muted-foreground"> days</span></p>
                <p className="text-xs text-muted-foreground mt-1">Keep it going!</p>
              </div>
              <div className="rounded-xl bg-orange-100 p-3 dark:bg-orange-900/30">
                <Flame className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Weekly Focus
            </CardTitle>
            <CardDescription>Minutes focused each day this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-48">
              {stats?.weeklyData?.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">{d.minutes}m</span>
                  <div className="w-full bg-muted rounded-t-md relative overflow-hidden" style={{ height: '100%' }}>
                    <div
                      className="absolute bottom-0 w-full rounded-t-md bg-gradient-to-t from-primary to-primary/60 transition-all duration-700"
                      style={{ height: `${(d.minutes / maxWeeklyMinutes) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{d.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Today's Tasks
              </CardTitle>
            </div>
            <Link href="/tasks"><Button variant="ghost" size="icon"><ArrowUpRight className="h-4 w-4" /></Button></Link>
          </CardHeader>
          <CardContent>
            {todayTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-8 w-8 mx-auto text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground mt-2">No tasks due today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                    <div className={cn2('h-2 w-2 rounded-full', task.status === 'done' ? 'bg-emerald-500' : task.status === 'in_progress' ? 'bg-blue-500' : 'bg-muted-foreground')} />
                    <span className={cn2('text-sm flex-1', task.status === 'done' && 'line-through text-muted-foreground')}>{task.title}</span>
                    <Badge variant={priorityColor(task.priority) as any} className="text-[10px]">{task.priority}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /> Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No upcoming tasks</p>
            ) : (
              <div className="space-y-3">
                {upcomingTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span className="text-sm">{task.title}</span>
                    </div>
                    {task.dueDate && (
                      <span className="text-xs text-muted-foreground">{new Date(task.dueDate).toLocaleDateString()}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Recently Completed</CardTitle>
          </CardHeader>
          <CardContent>
            {recentCompleted.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No completed tasks yet</p>
            ) : (
              <div className="space-y-3">
                {recentCompleted.map(task => (
                  <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="text-sm line-through text-muted-foreground">{task.title}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function cn2(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
