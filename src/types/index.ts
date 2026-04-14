export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'closed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  tags: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  taskId: string | null;
}

export interface FocusSession {
  id: string;
  duration: number;
  type: 'focus' | 'break';
  completed: boolean;
  startedAt: string;
  completedAt: string | null;
  userId: string;
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  focusMinutesToday: number;
  focusMinutesWeek: number;
  streak: number;
  completionRate: number;
}