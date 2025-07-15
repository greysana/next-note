export interface TaskContextProps {
  mainTasks: MainTask[];
  subTasks: SubTask[];
  scheduledTasks: ScheduledTask[];
  unscheduledTasks: UnscheduledTask[];
  addMainTask: (task: Omit<MainTask, "id" | "createdAt" | "updatedAt">) => void;
  addSubTask: (task: Omit<SubTask, "id" | "createdAt" | "updatedAt">) => void;
  addScheduledTask: (
    task: Omit<ScheduledTask, "id" | "createdAt" | "updatedAt">
  ) => void;
  addUnscheduledTask: (
    task: Omit<UnscheduledTask, "id" | "createdAt" | "updatedAt"> 
  ) => void;
  toggleSubTask: (id: string) => void;
  toggleUnscheduledTask: (id: string) => void;
  completeScheduledTask: (id: string) => void;
  deleteMainTask: (id: string) => void;
  deleteSubTask: (id: string) => void;
  deleteScheduledTask: (id: string) => void;
  deleteUnscheduledTask: (id: string) => void;
  getSubTasksForMain: (mainTaskId: string) => SubTask[];
  getScheduledTasksByFrequency: (frequency: string) => ScheduledTask[];
  addSubTaskToSubTask: (
    taskData: Omit<SubTask, "id" | "createdAt" | "updatedAt">
  ) => void;
  getSubTasksForSubTask: (parentSubTaskId: string) => SubTask[];
  deleteSubTaskAndChildren: (id: string) => void;
  updateSubTask: (
    id: string,
    updates: Partial<Omit<SubTask, "id" | "createdAt" | "updatedAt">>
  ) => void;
}
export interface MainTask {
  id: string;
  title: string;
  description?: string;
  color: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubTask {
  id: string;
  mainTaskId: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate?: Date;
  lastCompleted?: Date;
  userId: string;
  parentSubTaskId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduledTask {
  id: string;
  title: string;
  description?: string;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  priority: "low" | "medium" | "high";
  isActive: boolean;
  completed?: boolean;
  lastCompleted?: Date;
  nextDue: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UnscheduledTask {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  userId: string;
  lastCompleted?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Context
