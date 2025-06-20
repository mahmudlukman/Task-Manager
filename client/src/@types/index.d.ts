export interface RootState {
  auth: {
    accessToken: string | null;
    user: {
      _id: string;
      name: string;
      email: string;
      avatar: {
        public_id: string;
        url: string;
      };
      role: string;
      isActive: string;
    } | null;
  };
}

// Define interfaces based on ITask model
interface Todo {
  text: string;
  completed: boolean;
}

interface Attachment {
  public_id: string;
  url: string;
  filename: string;
  fileType: string;
  size?: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: { public_id: string; url: string };
  role: string;
  isActive: string;
  deletedAt?: Date | null;
}

// src/@types/index.ts (or inline in UsersTable.tsx)
interface ApiError {
  status: number | string;
  data?: {
    message: string;
    statusCode?: number;
  };
  error?: string;
}

interface Task {
  updatedAt: string;
  _id: string;
  title: string;
  description?: string;
  priority: "Low" | "Medium" | "High";
  status: "Pending" | "In Progress" | "Completed";
  progress: number;
  dueDate: string;
  createdAt: string;
  assignedTo: User[];
  todoChecklist: Todo[];
  attachments?: Attachment[];
  createdBy: {
    _id: string;
    name: string;
  };
}

interface GetAllTasksResponse {
  tasks: Task[];
  statusSummary: {
    all: number;
    pendingTasks: number;
    inProgressTasks: number;
    completedTasks: number;
  };
}

interface TaskDistribution {
  All: number;
  Pending: number;
  InProgress: number;
  Completed: number;
}

interface TaskPriorityLevels {
  Low: number;
  Medium: number;
  High: number;
}

interface Task {
  _id: string;
  title: string;
  description?: string;
  priority: "Low" | "Medium" | "High";
  status: "Pending" | "In Progress" | "Completed";
  progress: number;
  dueDate: string;
  createdAt: string;
  assignedTo: User[];
  todoChecklist: Todo[];
  attachments?: Attachment[];
  completedTodoCount?: number;
  createdBy: {
    _id: string;
    name: string;
  };
}

interface UserDashboardData {
  charts: {
    taskDistribution: TaskDistribution;
    taskPriorityLevels: TaskPriorityLevels;
  };
  recentTasks?: Task[];
}

interface Statistics {
  totalTasks: number;
  pendingTasks: number;
  completedTasks: number;
  overdueTasks: number;
}

interface AdminDashboardData {
  statistics: Statistics;
  charts: {
    taskDistribution: TaskDistribution;
    taskPriorityLevels: TaskPriorityLevels;
  };
  recentTasks?: Task[];
}

interface PieChartDataItem {
  status: string;
  count: number;
}

interface BarChartDataItem {
  priority: "Low" | "Medium" | "High";
  count: number;
}

interface StatusSummary {
  all: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
}

interface TasksResponse {
  tasks: Task[];
  statusSummary: StatusSummary;
}

interface StatusTab {
  label: string;
  count: number;
}

interface SearchParamsProps {
  searchParams: { [key: string]: string | undefined };
}

interface URLProps {
  params: { id: string };
  searchParams: { [key: string]: string | undefined };
}
