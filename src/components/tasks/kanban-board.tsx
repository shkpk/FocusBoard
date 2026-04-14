'use client';

import React from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { KanbanColumn } from './kanban-column';
import type { Task, TaskStatus } from '@/types';
import { Circle, Loader2, CheckCircle2 } from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  onDragEnd: (result: DropResult) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onClose: (id: string) => void;
  onReopen: (id: string) => void;
  onMove: (id: string, status: string) => void;
}

const columns: { status: TaskStatus; title: string; icon: React.ReactNode; accentColor: string }[] = [
  {
    status: 'todo',
    title: 'To Do',
    icon: <Circle className="h-3.5 w-3.5 text-slate-500" />,
    accentColor: 'bg-slate-100 dark:bg-slate-800',
  },
  {
    status: 'in_progress',
    title: 'In Progress',
    icon: <Loader2 className="h-3.5 w-3.5 text-blue-500" />,
    accentColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  {
    status: 'done',
    title: 'Done',
    icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
    accentColor: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
];

export function KanbanBoard({ tasks, onDragEnd, onEdit, onDelete, onClose, onReopen, onMove }: KanbanBoardProps) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-240px)]">
        {columns.map(col => (
          <KanbanColumn
            key={col.status}
            status={col.status}
            title={col.title}
            icon={col.icon}
            accentColor={col.accentColor}
            tasks={tasks.filter(t => t.status === col.status)}
            onEdit={onEdit}
            onDelete={onDelete}
            onClose={onClose}
            onReopen={onReopen}
            onMove={onMove}
          />
        ))}
      </div>
    </DragDropContext>
  );
}