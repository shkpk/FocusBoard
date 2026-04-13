'use client';

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
  tags: string | string[];
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
      const res = await fetch(`/api/tasks?${params}`);
      const data = await res.json();
      setTasks(data.map((t: any) => ({ ...t, tags: typeof t.tags === 'string' ? (t.tags ? t.tags.split(',').map((s: string) => s.trim()).filter(Boolean) : [] ) : t.tags })));
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
      tags: Array.isArray(task.tags) ? task.tags.join(', ') : (typeof task.tags === 'string' ? task.tags : ''),
    });
    setDialogOpen(true);
  };

  const saveTask = async () => {
    const tagsStr = form.tags.split(',').map(t => t.trim()).filter(Boolean).join(',');
    const payload = { ...form, tags: tagsStr, dueDate: form.dueDate || null };

    if (editingTask) {
      await fetch(`/api/tasks/${editingTask.id}`, {
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
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    loadTasks();
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/tasks/${id}`, {
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
                      <span className={`font-medium ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>{task.title}</span>
                      <Badge variant={priorityColor[task.priority] as any} className="text-[10px]">{task.priority}</Badge>
                    </div>
                    {task.description && <p className="text-sm text-muted-foreground mt-0.5 truncate">{task.description}</p>}
                    <div className="flex items-center gap-2 mt-1">
                      {Array.isArray(task.tags) && task.tags.map(tag => <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>)}
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
