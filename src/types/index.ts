export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'done';
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
  taskId: string;
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
