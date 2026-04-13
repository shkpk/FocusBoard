const fs = require('fs');
const path = require('path');

function writeFile(filePath, content) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content);
  console.log(`Created: ${filePath}`);
}

const base = path.join(__dirname, '..');

// ==================== ROOT LAYOUT ====================
writeFile(path.join(base, 'src/app/layout.tsx'), `import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SessionProvider } from "@/components/providers/session-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "FocusBoard - Deep Work & Task Management",
  description: "A premium productivity app for managing tasks and deep-work sessions",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={\`\${inter.variable} font-sans antialiased\`}>
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
`);

// ==================== SIDEBAR ====================
writeFile(path.join(base, 'src/components/layout/sidebar.tsx'), `'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, CheckSquare, Timer, StickyNote,
  ChevronLeft, ChevronRight, LogOut, Sun, Moon, Command
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useTheme } from 'next-themes';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/focus', label: 'Focus Timer', icon: Timer },
  { href: '/notes', label: 'Notes', icon: StickyNote },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = React.useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const { setTheme, theme } = useTheme();

  return (
    <aside className={cn(
      'fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-card transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Command className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">FocusBoard</span>
          </Link>
        )}
        <Button
          variant="ghost" size="icon" className={cn('shrink-0', !collapsed && 'ml-auto')}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href}>
              <span className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}>
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-2">
        <div className={cn('flex items-center gap-3 rounded-lg px-3 py-2', collapsed && 'justify-center')}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {session?.user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{session?.user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground">{session?.user?.email || ''}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session?.user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{session?.user?.email || ''}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
`);

// ==================== APP SHELL ====================
writeFile(path.join(base, 'src/components/layout/app-shell.tsx'), `'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './sidebar';
import { CommandPalette } from '@/components/command-palette';
import { TooltipProvider } from '@/components/ui/tooltip';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 ml-64 transition-all duration-300">
          <div className="container max-w-7xl mx-auto p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
      <CommandPalette />
    </TooltipProvider>
  );
}
`);

// ==================== DASHBOARD LAYOUT ====================
writeFile(path.join(base, 'src/app/(app)/layout.tsx'), `import { AppShell } from '@/components/layout/app-shell';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
`);

// ==================== DASHBOARD PAGE ====================
writeFile(path.join(base, 'src/app/(app)/dashboard/page.tsx'), `'use client';

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
    return new Date(t.dueDate) > new Date() && t.status !== 'done';
  }).slice(0, 5);

  const recentCompleted = tasks.filter(t => t.status === 'done').slice(0, 5);

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
                      style={{ height: \`\${(d.minutes / maxWeeklyMinutes) * 100}%\` }}
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
`);

// ==================== TASKS PAGE ====================
writeFile(path.join(base, 'src/app/(app)/tasks/page.tsx'), `'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Plus, Search, GripVertical, Trash2, Edit3, CheckCircle2, Circle, Clock,
  MoreHorizontal, Filter
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'done';
  dueDate: string | null;
  tags: string[];
  order: number;
}

const priorityColor: Record<string, string> = {
  urgent: 'destructive', high: 'warning', medium: 'info', low: 'secondary'
};

export default function TasksPage() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [filterPriority, setFilterPriority] = React.useState<string>('all');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [form, setForm] = React.useState({ title: '', description: '', priority: 'medium' as string, dueDate: '', tags: '' });
  const [activeTab, setActiveTab] = React.useState('all');
  const [dragItem, setDragItem] = React.useState<number | null>(null);

  const loadTasks = React.useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterPriority !== 'all') params.set('priority', filterPriority);
      const res = await fetch(\`/api/tasks?\${params}\`);
      const data = await res.json();
      setTasks(data);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [filterPriority]);

  React.useEffect(() => { loadTasks(); }, [loadTasks]);

  const filteredTasks = tasks.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeTab === 'todo') return t.status === 'todo';
    if (activeTab === 'in_progress') return t.status === 'in_progress';
    if (activeTab === 'done') return t.status === 'done';
    return true;
  });

  const openCreate = () => {
    setEditingTask(null);
    setForm({ title: '', description: '', priority: 'medium', dueDate: '', tags: '' });
    setDialogOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      tags: task.tags.join(', '),
    });
    setDialogOpen(true);
  };

  const saveTask = async () => {
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
    const payload = { ...form, tags, dueDate: form.dueDate || null };

    if (editingTask) {
      await fetch(\`/api/tasks/\${editingTask.id}\`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
    } else {
      await fetch('/api/tasks', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
    }
    setDialogOpen(false);
    loadTasks();
  };

  const deleteTask = async (id: string) => {
    await fetch(\`/api/tasks/\${id}\`, { method: 'DELETE' });
    loadTasks();
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(\`/api/tasks/\${id}\`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status })
    });
    loadTasks();
  };

  const handleDragStart = (index: number) => setDragItem(index);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragItem === null || dragItem === index) return;
    const updated = [...filteredTasks];
    const [removed] = updated.splice(dragItem, 1);
    updated.splice(index, 0, removed);
    setTasks(updated.map((t, i) => ({ ...t, order: i })));
    setDragItem(index);
  };

  const handleDragEnd = async () => {
    setDragItem(null);
    const reordered = filteredTasks.map((t, i) => ({ id: t.id, order: i }));
    await fetch('/api/tasks/reorder', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tasks: reordered })
    });
  };

  if (loading) {
    return <div className="space-y-4">{[...Array(3)].map((_, i) => (
      <Card key={i}><CardContent className="p-6"><div className="h-16 animate-pulse bg-muted rounded" /></CardContent></Card>
    ))}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-1">Manage and organize your work</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> New Task
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-40"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({tasks.length})</TabsTrigger>
          <TabsTrigger value="todo">To Do ({tasks.filter(t => t.status === 'todo').length})</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress ({tasks.filter(t => t.status === 'in_progress').length})</TabsTrigger>
          <TabsTrigger value="done">Done ({tasks.filter(t => t.status === 'done').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4 space-y-2">
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground/30" />
                <p className="mt-4 text-lg font-medium">No tasks found</p>
                <p className="text-sm text-muted-foreground">Create a new task to get started</p>
                <Button onClick={openCreate} className="mt-4 gap-2"><Plus className="h-4 w-4" />Create Task</Button>
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map((task, index) => (
              <Card
                key={task.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className="group hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <GripVertical className="h-5 w-5 text-muted-foreground/50 shrink-0" />
                  <button onClick={() => updateStatus(task.id, task.status === 'done' ? 'todo' : 'done')} className="shrink-0">
                    {task.status === 'done' ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : task.status === 'in_progress' ? (
                      <Clock className="h-5 w-5 text-blue-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={\`font-medium \${task.status === 'done' ? 'line-through text-muted-foreground' : ''}\`}>{task.title}</span>
                      <Badge variant={priorityColor[task.priority] as any} className="text-[10px]">{task.priority}</Badge>
                    </div>
                    {task.description && <p className="text-sm text-muted-foreground mt-0.5 truncate">{task.description}</p>}
                    <div className="flex items-center gap-2 mt-1">
                      {task.tags.map(tag => <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>)}
                      {task.dueDate && <span className="text-xs text-muted-foreground">{new Date(task.dueDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(task)}><Edit3 className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                      {task.status !== 'in_progress' && <DropdownMenuItem onClick={() => updateStatus(task.id, 'in_progress')}><Clock className="mr-2 h-4 w-4" />Start Progress</DropdownMenuItem>}
                      <DropdownMenuItem onClick={() => deleteTask(task.id)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task' : 'Create Task'}</DialogTitle>
            <DialogDescription>{editingTask ? 'Update your task details' : 'Add a new task to your board'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Task title..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select value={form.priority} onValueChange={v => setForm({...form, priority: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                <Input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags (comma separated)</label>
              <Input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="work, design, urgent..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveTask} disabled={!form.title.trim()}>{editingTask ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
`);

// ==================== FOCUS TIMER PAGE ====================
writeFile(path.join(base, 'src/app/(app)/focus/page.tsx'), `'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Timer, Coffee, Zap, History } from 'lucide-react';

interface FocusSession {
  id: string;
  duration: number;
  type: string;
  completed: boolean;
  startedAt: string;
}

export default function FocusPage() {
  const [focusDuration, setFocusDuration] = React.useState(25);
  const [breakDuration, setBreakDuration] = React.useState(5);
  const [timeLeft, setTimeLeft] = React.useState(25 * 60);
  const [isRunning, setIsRunning] = React.useState(false);
  const [isBreak, setIsBreak] = React.useState(false);
  const [sessions, setSessions] = React.useState<FocusSession[]>([]);
  const [totalFocus, setTotalFocus] = React.useState(0);

  const totalTime = (isBreak ? breakDuration : focusDuration) * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  React.useEffect(() => {
    fetch('/api/focus').then(r => r.json()).then(data => {
      setSessions(data);
      const today = new Date().toDateString();
      setTotalFocus(data.filter((s: FocusSession) => new Date(s.startedAt).toDateString() === today && s.completed).reduce((a: number, s: FocusSession) => a + s.duration, 0));
    }).catch(() => {});
  }, []);

  React.useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          if (!isBreak) {
            saveSession(focusDuration);
            setIsBreak(true);
            return breakDuration * 60;
          } else {
            setIsBreak(false);
            return focusDuration * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, isBreak, focusDuration, breakDuration]);

  const saveSession = async (duration: number) => {
    try {
      const res = await fetch('/api/focus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration, type: 'focus', completed: true }),
      });
      const session = await res.json();
      setSessions(prev => [session, ...prev]);
      setTotalFocus(prev => prev + duration);
    } catch { /* ignore */ }
  };

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(focusDuration * 60);
  };

  const selectDuration = (min: number) => {
    setFocusDuration(min);
    if (!isRunning && !isBreak) setTimeLeft(min * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Focus Timer</h1>
        <p className="text-muted-foreground mt-1">Deep work sessions with Pomodoro technique</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col items-center">
          <Card className="w-full max-w-lg">
            <CardContent className="p-8 flex flex-col items-center">
              <div className="mb-6 flex items-center gap-2">
                <Badge variant={isBreak ? 'secondary' : 'default'} className="text-sm">
                  {isBreak ? <><Coffee className="h-3 w-3 mr-1" /> Break</> : <><Zap className="h-3 w-3 mr-1" /> Focus</>}
                </Badge>
              </div>

              <div className="relative flex items-center justify-center w-64 h-64 mb-8">
                <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-muted/30" strokeWidth="2" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor"
                    className="text-primary transition-all duration-1000" strokeWidth="2" strokeLinecap="round"
                    strokeDasharray={\`\${2 * Math.PI * 45}\`}
                    strokeDashoffset={\`\${2 * Math.PI * 45 * (1 - progress / 100)}\`}
                  />
                </svg>
                <div className="text-center">
                  <span className="text-6xl font-bold tabular-nums tracking-tight">
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                  </span>
                  <p className="text-sm text-muted-foreground mt-2">{isBreak ? 'Take a break' : 'Stay focused'}</p>
                </div>
              </div>

              <Progress value={progress} className="w-full mb-8 h-2" />

              <div className="flex items-center gap-4">
                <Button size="lg" onClick={toggleTimer} className="w-32 gap-2 text-base">
                  {isRunning ? <><Pause className="h-5 w-5" /> Pause</> : <><Play className="h-5 w-5" /> Start</>}
                </Button>
                <Button size="lg" variant="outline" onClick={resetTimer} className="gap-2">
                  <RotateCcw className="h-4 w-4" /> Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2 mt-6">
            {[15, 25, 30, 45, 60].map(d => (
              <Button key={d} variant={focusDuration === d ? 'default' : 'outline'} size="sm" onClick={() => selectDuration(d)}>
                {d}m
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Today's Focus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{totalFocus}<span className="text-lg font-normal text-muted-foreground"> min</span></div>
              <p className="text-sm text-muted-foreground">{Math.round(totalFocus / 60 * 10) / 10} hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><History className="h-4 w-4" /> Session History</CardTitle>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No sessions yet</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {sessions.slice(0, 10).map(s => (
                    <div key={s.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span>{s.duration} min focus</span>
                      </div>
                      <span className="text-muted-foreground text-xs">{new Date(s.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Break Duration</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              {[3, 5, 10, 15].map(d => (
                <Button key={d} variant={breakDuration === d ? 'default' : 'outline'} size="sm" onClick={() => { setBreakDuration(d); if (isBreak && !isRunning) setTimeLeft(d * 60); }}>
                  {d}m
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
`);

// ==================== NOTES PAGE ====================
writeFile(path.join(base, 'src/app/(app)/notes/page.tsx'), `'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, StickyNote, Save } from 'lucide-react';

interface Note { id: string; content: string; taskId: string | null; updatedAt: string; }
interface Task { id: string; title: string; }

export default function NotesPage() {
  const [notes, setNotes] = React.useState<Note[]>([]);
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedNote, setSelectedNote] = React.useState<Note | null>(null);
  const [saveTimeout, setSaveTimeout] = React.useState<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    Promise.all([fetch('/api/notes').then(r => r.json()), fetch('/api/tasks').then(r => r.json())])
      .then(([n, t]) => { setNotes(n); setTasks(t); if (n.length > 0) setSelectedNote(n[0]); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const createNote = async () => {
    const res = await fetch('/api/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: '' }) });
    const note = await res.json();
    setNotes(prev => [note, ...prev]);
    setSelectedNote(note);
  };

  const updateNote = (content: string) => {
    if (!selectedNote) return;
    const updated = { ...selectedNote, content };
    setSelectedNote(updated);
    setNotes(prev => prev.map(n => n.id === selectedNote.id ? updated : n));

    if (saveTimeout) clearTimeout(saveTimeout);
    const t = setTimeout(async () => {
      await fetch(\`/api/notes/\${selectedNote.id}\`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content })
      });
    }, 500);
    setSaveTimeout(t);
  };

  const deleteNote = async (id: string) => {
    await fetch(\`/api/notes/\${id}\`, { method: 'DELETE' });
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    if (selectedNote?.id === id) setSelectedNote(updated[0] || null);
  };

  const linkTask = async (taskId: string) => {
    if (!selectedNote) return;
    await fetch(\`/api/notes/\${selectedNote.id}\`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: selectedNote.content, taskId })
    });
    const updated = { ...selectedNote, taskId };
    setSelectedNote(updated);
    setNotes(prev => prev.map(n => n.id === selectedNote.id ? updated : n));
  };

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <Card key={i}><CardContent className="p-6"><div className="h-32 animate-pulse bg-muted rounded" /></CardContent></Card>)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
          <p className="text-muted-foreground mt-1">Quick notes linked to your tasks</p>
        </div>
        <Button onClick={createNote} className="gap-2"><Plus className="h-4 w-4" />New Note</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">All Notes ({notes.length})</h3>
          {notes.length === 0 ? (
            <Card><CardContent className="py-8 text-center"><StickyNote className="h-8 w-8 mx-auto text-muted-foreground/50" /><p className="text-sm text-muted-foreground mt-2">No notes yet</p></CardContent></Card>
          ) : notes.map(note => (
            <Card key={note.id} className={\`cursor-pointer transition-all hover:shadow-md \${selectedNote?.id === note.id ? 'ring-2 ring-primary' : ''}\`} onClick={() => setSelectedNote(note)}>
              <CardContent className="p-4">
                <p className="text-sm truncate">{note.content || 'Empty note'}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">{new Date(note.updatedAt).toLocaleDateString()}</span>
                  {note.taskId && <Badge variant="outline" className="text-[10px]">Linked</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-2">
          {selectedNote ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><Save className="h-4 w-4 text-muted-foreground" />Autosaved</CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={selectedNote.taskId || 'none'} onValueChange={linkTask}>
                    <SelectTrigger className="w-48"><SelectValue placeholder="Link to task..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No task</SelectItem>
                      {tasks.map(t => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" onClick={() => deleteNote(selectedNote.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea value={selectedNote.content} onChange={e => updateNote(e.target.value)} placeholder="Start typing..." className="min-h-[400px] text-base leading-relaxed resize-y" />
              </CardContent>
            </Card>
          ) : (
            <Card><CardContent className="py-16 text-center"><StickyNote className="h-12 w-12 mx-auto text-muted-foreground/30" /><p className="mt-4 text-lg font-medium">Select a note</p><p className="text-sm text-muted-foreground">Choose from the sidebar or create a new one</p></CardContent></Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Badge({ className, variant, children }: { className?: string; variant?: string; children: React.ReactNode }) {
  const cls = {
    outline: 'border px-2 py-0.5 rounded-full text-xs',
  }[variant || 'outline'] || 'border px-2 py-0.5 rounded-full text-xs';
  return <span className={\`\${cls} \${className || ''}\`}>{children}</span>;
}
`);

// ==================== LANDING PAGE ====================
writeFile(path.join(base, 'src/app/page.tsx'), `'use client';

import React from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Command, Zap, Target, Timer, CheckSquare, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLogin, setIsLogin] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [form, setForm] = React.useState({ name: '', email: '', password: '' });

  React.useEffect(() => {
    if (session) router.push('/dashboard');
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const result = await signIn('credentials', { email: form.email, password: form.password, redirect: false });
        if (result?.error) setError('Invalid email or password');
        else router.push('/dashboard');
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) { const data = await res.json(); setError(data.error || 'Registration failed'); setLoading(false); return; }
        await signIn('credentials', { email: form.email, password: form.password, redirect: false });
        router.push('/dashboard');
      }
    } catch { setError('Something went wrong'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 items-center justify-center p-12">
        <div className="max-w-md space-y-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
              <Command className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-3xl font-bold tracking-tight">FocusBoard</span>
          </div>
          <h2 className="text-4xl font-bold leading-tight">Master your productivity with deep focus</h2>
          <p className="text-lg text-muted-foreground">A premium task management and focus timer app designed for deep work enthusiasts.</p>
          <div className="space-y-4 pt-4">
            {[
              { icon: CheckSquare, title: 'Smart Task Management', desc: 'Organize, prioritize, and track tasks with ease' },
              { icon: Timer, title: 'Pomodoro Timer', desc: 'Deep work sessions with customizable intervals' },
              { icon: Target, title: 'Productivity Insights', desc: 'Track your focus hours and streaks' },
              { icon: Zap, title: 'Quick Notes', desc: 'Capture ideas linked to your tasks' },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-4 p-3 rounded-lg hover:bg-background/50 transition-colors">
                <div className="rounded-lg bg-primary/10 p-2"><f.icon className="h-5 w-5 text-primary" /></div>
                <div><p className="font-medium">{f.title}</p><p className="text-sm text-muted-foreground">{f.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-2 mb-2 lg:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary"><Command className="h-4 w-4 text-primary-foreground" /></div>
              <span className="text-xl font-bold">FocusBoard</span>
            </div>
            <CardTitle className="text-2xl">{isLogin ? 'Welcome back' : 'Create account'}</CardTitle>
            <CardDescription>{isLogin ? 'Sign in to your account' : 'Start your productivity journey'}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Your name" required />
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@example.com" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" required minLength={6} />
              </div>
              {error && <p className="text-sm text-destructive">{typeof error === 'string' ? error : 'An error occurred'}</p>}
              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading ? 'Please wait...' : <>{isLogin ? 'Sign In' : 'Create Account'} <ArrowRight className="h-4 w-4" /></>}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
`);

console.log('All pages and layout created!');