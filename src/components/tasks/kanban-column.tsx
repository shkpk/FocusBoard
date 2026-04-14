'use client';

import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { TaskCard } from './task-card';
import type { Task, TaskStatus } from '@/types';

interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  icon: React.ReactNode;
  tasks: Task[];
  accentColor: string;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onClose: (id: string) => void;
  onReopen: (id: string) => void;
  onMove: (id: string, status: string) => void;
}

export function KanbanColumn({ status, title, icon, tasks, accentColor, onEdit, onDelete, onClose, onReopen, onMove }: KanbanColumnProps) {
  return (
    <div className="flex flex-col min-w-[300px] w-[300px] flex-shrink-0">
      {/* Column header */}
      <div className="flex items-center gap-2 px-1 mb-3">
        <div className={`flex items-center justify-center h-6 w-6 rounded-md ${accentColor}`}>
          {icon}
        </div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="ml-auto inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
          {tasks.length}
        </span>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-[200px] rounded-xl p-2 space-y-2 transition-colors duration-200 ${
              snapshot.isDraggingOver
                ? 'bg-accent/50 ring-2 ring-primary/10'
                : 'bg-muted/30'
            }`}
          >
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/50">
                <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center mb-2">
                  <span className="text-lg">+</span>
                </div>
                <p className="text-xs">Drop tasks here</p>
              </div>
            )}
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onEdit={onEdit}
                onDelete={onDelete}
                onClose={onClose}
                onReopen={onReopen}
                onMove={onMove}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}