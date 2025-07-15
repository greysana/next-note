import {
  MainTask,
  ScheduledTask,
  SubTask,
  UnscheduledTask,
} from "@/types/task";

export const sampleMainTasks: MainTask[] = [
  {
    id: "1",
    title: "Work Projects",
    description: "Professional tasks and projects",
    color: "#3B82F6",
    userId: "user1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    title: "Exercise & Health",
    description: "Fitness and wellness goals",
    color: "#10B981",
    userId: "user1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    title: "Personal Projects",
    description: "Hobbies and personal development",
    color: "#F59E0B",
    userId: "user1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const sampleSubTasks: SubTask[] = [
  {
    id: "1",
    mainTaskId: "1",
    title: "Complete project proposal",
    description: "Draft and review the Q2 project proposal",
    completed: false,
    priority: "high",
    dueDate: new Date(Date.now() + 86400000),
    userId: "user1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    mainTaskId: "1",
    title: "Review team performance",
    completed: true,
    priority: "medium",
    userId: "user1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const sampleScheduledTasks: ScheduledTask[] = [
  {
    id: "1",
    title: "Morning workout",
    description: "30 minutes cardio",
    frequency: "daily",
    priority: "high",
    isActive: true,
    nextDue: new Date(),
    userId: "user1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    title: "Weekly planning session",
    frequency: "weekly",
    priority: "medium",
    isActive: true,
    nextDue: new Date(Date.now() + 86400000 * 7),
    userId: "user1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const sampleUnscheduledTasks: UnscheduledTask[] = [
  {
    id: "1",
    title: "Clean garage",
    description: "Organize tools and equipment",
    priority: "low",
    completed: false,
    userId: "user1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    title: "Read new book",
    priority: "medium",
    completed: false,
    userId: "user1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
