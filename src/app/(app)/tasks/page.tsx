'use client';

import React from 'react';
import { DropResult } from '@hello-pangea/dnd';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Plus, LayoutGrid, List, Loader2 } from 'lucide-react';
import { KanbanBoard } from '@/components/tasks/kanban-board';
import { TaskList } from '@/components/tasks/task-list';
import { TaskDialog } from '@/components/tasks/task-dialog';
import { TaskFilters, TaskFiltersState } from '@/components/tasks/task-filters';
import type { Task, TaskPriority, TaskStatus } from '@/types';

type ViewMode = 'board' | 'list';

export default function TasksPage() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [view, setView] = React.useState<ViewMode>('board');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [filters, setFilters] = React.useState<TaskFiltersState>({
    search: '',
    status: '',
    priority: '',
    tag: '',
    showClosed: false,
  });

  const fetchTasks = React.useCallback(async () => {
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        // Parse tags from comma-separated strings to arrays
        const parsed = data.map((t: any) => ({
          ...t,
          tags: typeof t.tags === 'string' && t.tags
            ? t.tags.split(',').map((s: string) => s.trim()).filter(Boolean)
            : Array.isArray(t.tags) ? t.tags : [],
        }));
        setTasks(parsed);
      }
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Extract all unique tags
  const allTags = React.useMemo(() => {
    const tagSet = new Set<string>();
    tasks.forEach(t => {
      if (Array.isArray(t.tags)) t.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [tasks]);

  // Filter tasks based on current filters
  const filteredTasks = React.useMemo(() => {
    let result = [...tasks];

    // Board view: always exclude closed
    if (view === 'board') {
      result = result.filter(t => t.status !== 'closed');
    }

    // List view: hide closed by default
    if (view === 'list' && !filters.showClosed && !filters.status) {
      result = result.filter(t => t.status !== 'closed');
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (Array.isArray(t.tags) && t.tags.some(tag => tag.toLowerCase().includes(q)))
      );
    }

    if (filters.status) {
      result = result.filter(t => t.status === filters.status);
    }

    if (filters.priority) {
      result = result.filter(t => t.priority === filters.priority);
    }

    if (filters.tag) {
      result = result.filter(t => Array.isArray(t.tags) && t.tags.includes(filters.tag));
    }

    return result;
  }, [tasks, filters, view]);

  // CRUD handlers
  const handleSave = async (data: {
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate: string | null;
    tags: string;
  }) => {
    if (editingTask) {
      const res = await fetch(`/api/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success('Task updated');
        await fetchTasks();
      } else {
        toast.error('Failed to update task');
      }
    } else {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success('Task created');
        await fetchTasks();
      } else {
        toast.error('Failed to create task');
      }
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Task deleted');
      setTasks(prev => prev.filter(t => t.id !== id));
    } else {
      toast.error('Failed to delete task');
    }
  };

  const handleClose = async (id: string) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'closed' }),
    });
    if (res.ok) {
      toast.success('Task closed');
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'closed' as TaskStatus } : t));
    } else {
      toast.error('Failed to close task');
    }
  };

  const handleReopen = async (id: string) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'todo' }),
    });
    if (res.ok) {
      toast.success('Task reopened');
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'todo' as TaskStatus } : t));
    } else {
      toast.error('Failed to reopen task');
    }
  };

  const handleMove = async (id: string, newStatus: string) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      toast.success(`Moved to ${newStatus.replace('_', ' ')}`);
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus as TaskStatus } : t));
    } else {
      toast.error('Failed to move task');
    }
  };

  // Drag and drop handler
  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceStatus = source.droppableId as TaskStatus;
    const destStatus = destination.droppableId as TaskStatus;

    // Optimistically update local state
    const newTasks = [...tasks];
    const taskIndex = newTasks.findIndex(t => t.id === draggableId);
    if (taskIndex === -1) return;

    const movedTask = { ...newTasks[taskIndex], status: destStatus };
    newTasks.splice(taskIndex, 1);
    newTasks.splice(taskIndex, 0, movedTask);
    setTasks(newTasks);

    // Build reorder payloads for affected columns
    const updates: Array<{ id: string; order: number; status: string }> = [];

    // Reindex destination column
    const destTasks = newTasks
      .filter(t => t.status === destStatus)
      .sort((a, b) => a.order - b.order);

    // Remove the moved task and reinsert at destination index
    const destWithoutMoved = destTasks.filter(t => t.id !== draggableId);
    destWithoutMoved.splice(destination.index, 0, movedTask);

    destWithoutMoved.forEach((t, i) => {
      updates.push({ id: t.id, order: i, status: destStatus });
    });

    // If source column changed, reindex source column too
    if (sourceStatus !== destStatus) {
      const sourceTasks = newTasks
        .filter(t => t.status === sourceStatus)
        .sort((a, b) => a.order - b.order);

      sourceTasks.forEach((t, i) => {
        updates.push({ id: t.id, order: i, status: sourceStatus });
      });
    }

    try {
      await fetch('/api/tasks/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: updates }),
      });
    } catch {
      toast.error('Failed to persist order');
      await fetchTasks();
    }
  };

  const openCreate = () => {
    setEditingTask(null);
    setDialogOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-40 animate-pulse bg-muted rounded" />
          <div className="h-9 w-24 animate-pulse bg-muted rounded" />
        </div>
        <div className="flex gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-[300px] space-y-3">
              <div className="h-8 animate-pulse bg-muted rounded" />
              {[1, 2, 3].map(j => (
                <div key={j} className="h-28 animate-pulse bg-muted rounded-lg" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-1">Manage and organize your work</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> New Task
        </Button>
      </div>

      {/* View switcher + filters */}
      <div className="space-y-4">
        {/* View tabs */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center rounded-lg border bg-muted/50 p-0.5">
            <button
              onClick={() => setView('board')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                view === 'board'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Board
            </button>
            <button
              onClick={() => setView('list')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                view === 'list'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="h-3.5 w-3.5" /> List
            </button>
          </div>

          <div className="text-xs text-muted-foreground">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Filters */}
        <TaskFilters
          filters={filters}
          onChange={setFilters}
          availableTags={allTags}
          showStatusFilter={view === 'list'}
          showClosedToggle={view === 'list'}
        />
      </div>

      {/* View content */}
      {view === 'board' ? (
        <KanbanBoard
          tasks={filteredTasks}
          onDragEnd={handleDragEnd}
          onEdit={openEdit}
          onDelete={handleDelete}
          onClose={handleClose}
          onReopen={handleReopen}
          onMove={handleMove}
        />
      ) : (
        <TaskList
          tasks={filteredTasks}
          onEdit={openEdit}
          onDelete={handleDelete}
          onReopen={handleReopen}
          onMove={handleMove}
        />
      )}

      {/* Task create/edit dialog */}
      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        onSave={handleSave}
      />
    </div>
  );
}