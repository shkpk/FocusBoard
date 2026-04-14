'use client';

import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar, MoreHorizontal, Pencil, Trash2, CheckCircle, XCircle, GripVertical } from 'lucide-react';
import type { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onClose?: (id: string) => void;
  onReopen?: (id: string) => void;
  onMove?: (id: string, status: string) => void;
}

const priorityConfig: Record<string, { label: string; className: string }> = {
  urgent: { label: 'Urgent', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800' },
  high: { label: 'High', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800' },
  medium: { label: 'Medium', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
  low: { label: 'Low', className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700' },
};

export function TaskCard({ task, index, onEdit, onDelete, onClose, onReopen, onMove }: TaskCardProps) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done' && task.status !== 'closed';
  const tags = Array.isArray(task.tags) ? task.tags : [];
  const pConfig = priorityConfig[task.priority] || priorityConfig.medium;

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`group relative bg-card border rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200 ${
            snapshot.isDragging ? 'shadow-lg ring-2 ring-primary/20 rotate-2 scale-[1.02]' : ''
          }`}
        >
          {/* Drag handle */}
          <div {...provided.dragHandleProps} className="absolute top-2 left-1 opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
            <GripVertical className="h-4 w-4" />
          </div>

          <div className="pl-2">
            {/* Header row */}
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h4 className="text-sm font-medium leading-snug line-clamp-2 flex-1">{task.title}</h4>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => onEdit(task)}>
                    <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                  </DropdownMenuItem>
                  {task.status === 'done' && onClose && (
                    <DropdownMenuItem onClick={() => onClose(task.id)}>
                      <CheckCircle className="h-3.5 w-3.5 mr-2" /> Close Task
                    </DropdownMenuItem>
                  )}
                  {task.status === 'closed' && onReopen && (
                    <DropdownMenuItem onClick={() => onReopen(task.id)}>
                      <XCircle className="h-3.5 w-3.5 mr-2" /> Reopen
                    </DropdownMenuItem>
                  )}
                  {onMove && task.status !== 'todo' && (
                    <DropdownMenuItem onClick={() => onMove(task.id, 'todo')}>Move to To Do</DropdownMenuItem>
                  )}
                  {onMove && task.status !== 'in_progress' && (
                    <DropdownMenuItem onClick={() => onMove(task.id, 'in_progress')}>Move to In Progress</DropdownMenuItem>
                  )}
                  {onMove && task.status !== 'done' && (
                    <DropdownMenuItem onClick={() => onMove(task.id, 'done')}>Move to Done</DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive focus:text-destructive">
                    <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Description preview */}
            {task.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{task.description}</p>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {tags.slice(0, 3).map((tag: string) => (
                  <span key={tag} className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {tag}
                  </span>
                ))}
                {tags.length > 3 && (
                  <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    +{tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between gap-2">
              <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${pConfig.className}`}>
                {pConfig.label}
              </span>
              {task.dueDate && (
                <span className={`flex items-center gap-1 text-[10px] ${isOverdue ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                  <Calendar className="h-3 w-3" />
                  {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}