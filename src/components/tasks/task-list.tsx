'use client';

import React from 'react';
import type { Task, TaskStatus, TaskPriority } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar, MoreHorizontal, Pencil, Trash2, CheckCircle, XCircle, Circle, Loader2, ArrowUp } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onReopen: (id: string) => void;
  onMove: (id: string, status: string) => void;
}

const statusIcon: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  todo: { icon: <Circle className="h-4 w-4" />, color: 'text-slate-400', label: 'To Do' },
  in_progress: { icon: <Loader2 className="h-4 w-4" />, color: 'text-blue-500', label: 'In Progress' },
  done: { icon: <CheckCircle className="h-4 w-4" />, color: 'text-emerald-500', label: 'Done' },
  closed: { icon: <XCircle className="h-4 w-4" />, color: 'text-muted-foreground', label: 'Closed' },
};

const priorityBadge: Record<string, { color: string; label: string }> = {
  urgent: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: 'Urgent' },
  high: { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', label: 'High' },
  medium: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', label: 'Medium' },
  low: { color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400', label: 'Low' },
};

export function TaskList({ tasks, onEdit, onDelete, onReopen, onMove }: TaskListProps) {
  return (
    <div className="border rounded-xl overflow-hidden bg-card">
      {/* Table header */}
      <div className="grid grid-cols-[1fr_100px_90px_100px_120px_44px] gap-2 px-4 py-2.5 bg-muted/50 border-b text-xs font-medium text-muted-foreground">
        <span>Title</span>
        <span>Status</span>
        <span>Priority</span>
        <span>Due Date</span>
        <span>Tags</span>
        <span></span>
      </div>

      {/* Rows */}
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/50">
          <Circle className="h-8 w-8 mb-2" />
          <p className="text-sm">No tasks found</p>
        </div>
      ) : (
        <div className="divide-y">
          {tasks.map(task => {
            const sConfig = statusIcon[task.status] || statusIcon.todo;
            const pConfig = priorityBadge[task.priority] || priorityBadge.medium;
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done' && task.status !== 'closed';
            const tags = Array.isArray(task.tags) ? task.tags : [];

            return (
              <div
                key={task.id}
                className={`grid grid-cols-[1fr_100px_90px_100px_120px_44px] gap-2 px-4 py-3 items-center hover:bg-accent/30 transition-colors group ${
                  task.status === 'closed' ? 'opacity-60' : ''
                }`}
              >
                {/* Title */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className={sConfig.color}>
                    {sConfig.icon}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-medium truncate ${task.status === 'done' || task.status === 'closed' ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                    )}
                  </div>
                </div>

                {/* Status */}
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${sConfig.color}`}>
                  {sConfig.icon}
                  {sConfig.label}
                </span>

                {/* Priority */}
                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium w-fit ${pConfig.color}`}>
                  {pConfig.label}
                </span>

                {/* Due date */}
                <span className={`text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : '—'}
                </span>

                {/* Tags */}
                <div className="flex gap-1 flex-wrap">
                  {tags.slice(0, 2).map(tag => (
                    <span key={tag} className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                  {tags.length > 2 && (
                    <span className="text-[10px] text-muted-foreground">+{tags.length - 2}</span>
                  )}
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={() => onEdit(task)}>
                      <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                    </DropdownMenuItem>
                    {task.status === 'closed' && (
                      <DropdownMenuItem onClick={() => onReopen(task.id)}>
                        <ArrowUp className="h-3.5 w-3.5 mr-2" /> Reopen
                      </DropdownMenuItem>
                    )}
                    {task.status !== 'todo' && (
                      <DropdownMenuItem onClick={() => onMove(task.id, 'todo')}>Move to To Do</DropdownMenuItem>
                    )}
                    {task.status !== 'in_progress' && task.status !== 'closed' && (
                      <DropdownMenuItem onClick={() => onMove(task.id, 'in_progress')}>Move to In Progress</DropdownMenuItem>
                    )}
                    {task.status !== 'done' && task.status !== 'closed' && (
                      <DropdownMenuItem onClick={() => onMove(task.id, 'done')}>Move to Done</DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive focus:text-destructive">
                      <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}