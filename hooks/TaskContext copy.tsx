// "use client";
// import { createContext, useContext, useState, useEffect } from "react";
// import { Task, TaskCategory, TaskWithSubtasks, CreateTaskData, UpdateTaskData } from "@/types/task";

// interface TaskContextProps {
//   tasks: Task[];
//   categories: TaskCategory[];
//   currentTask: TaskWithSubtasks | null;
//   setCurrentTask: (task: TaskWithSubtasks | null) => void;
//   addTask: (task: CreateTaskData) => void;
//   updateTask: (id: string, task: UpdateTaskData) => void;
//   deleteTask: (id: string) => void;
//   duplicateTask: (id: string) => void;
//   toggleTaskComplete: (id: string) => void;
//   addCategory: (category: Omit<TaskCategory, 'id' | 'createdAt' | 'updatedAt'>) => void;
//   updateCategory: (id: string, updates: Partial<Omit<TaskCategory, 'id' | 'createdAt' | 'updatedAt'>>) => void;
//   deleteCategory: (id: string) => void;
//   getTasksByCategory: (categoryId: string | null) => Task[];
//   getTaskWithSubtasks: (id: string) => TaskWithSubtasks | null;
//   getSubtasks: (parentId: string) => Task[];
//   getTodaysTasks: () => Task[];
//   getOverdueTasks: () => Task[];
// }

// const TaskContext = createContext<TaskContextProps | undefined>(undefined);

// export function TaskProvider({ children }: { children: React.ReactNode }) {
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [categories, setCategories] = useState<TaskCategory[]>([]);
//   const [currentTask, setCurrentTask] = useState<TaskWithSubtasks | null>(null);

//   // Load data from localStorage on mount
//   useEffect(() => {
//     const savedTasks = localStorage.getItem('nextnote-tasks');
//     const savedCategories = localStorage.getItem('nextnote-categories');
    
//     if (savedTasks) {
//       const parsedTasks = JSON.parse(savedTasks).map((task: Task) => ({
//         ...task,
//         createdAt: new Date(task.createdAt),
//         updatedAt: new Date(task.updatedAt),
//         dueDate: task.dueDate ? new Date(task.dueDate) : undefined
//       }));
//       setTasks(parsedTasks);
//     }
    
//     if (savedCategories) {
//       const parsedCategories = JSON.parse(savedCategories).map((category: TaskCategory) => ({
//         ...category,
//         createdAt: new Date(category.createdAt),
//         updatedAt: new Date(category.updatedAt)
//       }));
//       setCategories(parsedCategories);
//     } else {
//       // Create default categories
//       const defaultCategories = [
//         {
//           id: 'general',
//           name: 'General',
//           color: '#3B82F6',
//           userId: 'default-user',
//           createdAt: new Date(),
//           updatedAt: new Date()
//         },
//         {
//           id: 'work',
//           name: 'Work',
//           color: '#EF4444',
//           userId: 'default-user',
//           createdAt: new Date(),
//           updatedAt: new Date()
//         },
//         {
//           id: 'personal',
//           name: 'Personal',
//           color: '#10B981',
//           userId: 'default-user',
//           createdAt: new Date(),
//           updatedAt: new Date()
//         }
//       ];
//       setCategories(defaultCategories);
//     }
//   }, []);

//   // Save to localStorage whenever data changes
//   useEffect(() => {
//     localStorage.setItem('nextnote-tasks', JSON.stringify(tasks));
//   }, [tasks]);

//   useEffect(() => {
//     localStorage.setItem('nextnote-categories', JSON.stringify(categories));
//   }, [categories]);

//   const addTask = (taskData: CreateTaskData) => {
//     const newTask: Task = {
//       ...taskData,
//       id: Date.now().toString(),
//       completed: false,
//       timeSpent: 0,
//       createdAt: new Date(),
//       updatedAt: new Date()
//     };
//     setTasks(prev => [...prev, newTask]);
//   };

//   const updateTask = (id: string, updates: UpdateTaskData) => {
//     setTasks(prev =>
//       prev.map(task => 
//         task.id === id 
//           ? { ...task, ...updates, updatedAt: new Date() }
//           : task
//       )
//     );
//   };

//   const deleteTask = (id: string) => {
//     // Also delete all subtasks
//     setTasks(prev => prev.filter(task => task.id !== id && task.parentTaskId !== id));
    
//     // Clear current task if it's being deleted
//     if (currentTask?.id === id) {
//       setCurrentTask(null);
//     }
//   };

//   const duplicateTask = (id: string) => {
//     const taskToClone = tasks.find(task => task.id === id);
//     if (taskToClone) {
//       const duplicatedTask: Task = {
//         ...taskToClone,
//         id: Date.now().toString(),
//         title: `${taskToClone.title} (Copy)`,
//         completed: false,
//         createdAt: new Date(),
//         updatedAt: new Date()
//       };
//       setTasks(prev => [...prev, duplicatedTask]);
//     }
//   };

//   const toggleTaskComplete = (id: string) => {
//     const task = tasks.find(t => t.id === id);
//     if (!task) return;

//     const newCompleted = !task.completed;
    
//     // Update the task
//     updateTask(id, { completed: newCompleted });

//     // If this is a subtask, check if parent should be completed
//     if (task.parentTaskId) {
//       const siblings = tasks.filter(t => t.parentTaskId === task.parentTaskId);
//       const completedSiblings = siblings.filter(t => t.id === id ? newCompleted : t.completed);
      
//       if (completedSiblings.length === siblings.length) {
//         // All subtasks are complete, mark parent as complete
//         updateTask(task.parentTaskId, { completed: true });
//       } else if (newCompleted === false) {
//         // A subtask was unchecked, uncheck parent
//         updateTask(task.parentTaskId, { completed: false });
//       }
//     }

//     // If this is a parent task being marked incomplete, mark all subtasks as incomplete
//     if (!newCompleted && !task.parentTaskId) {
//       const subtasks = tasks.filter(t => t.parentTaskId === id);
//       subtasks.forEach(subtask => {
//         updateTask(subtask.id, { completed: false });
//       });
//     }
//   };

//   const addCategory = (categoryData: Omit<TaskCategory, 'id' | 'createdAt' | 'updatedAt'>) => {
//     const newCategory: TaskCategory = {
//       ...categoryData,
//       id: Date.now().toString(),
//       createdAt: new Date(),
//       updatedAt: new Date()
//     };
//     setCategories(prev => [...prev, newCategory]);
//   };

//   const updateCategory = (id: string, updates: Partial<Omit<TaskCategory, 'id' | 'createdAt' | 'updatedAt'>>) => {
//     setCategories(prev =>
//       prev.map(category =>
//         category.id === id
//           ? { ...category, ...updates, updatedAt: new Date() }
//           : category
//       )
//     );
//   };

//   const deleteCategory = (id: string) => {
//     // Don't delete if it's the last category or default categories
//     if (categories.length <= 1 || ['general', 'work', 'personal'].includes(id)) return;
    
//     // Move tasks from deleted category to general category
//     setTasks(prev =>
//       prev.map(task =>
//         task.categoryId === id
//           ? { ...task, categoryId: 'general', updatedAt: new Date() }
//           : task
//       )
//     );
//     setCategories(prev => prev.filter(category => category.id !== id));
//   };

//   const getTasksByCategory = (categoryId: string | null) => {
//     return tasks.filter(task => task.categoryId === categoryId && !task.parentTaskId);
//   };

//   const getSubtasks = (parentId: string) => {
//     return tasks.filter(task => task.parentTaskId === parentId);
//   };

//   const getTaskWithSubtasks = (id: string): TaskWithSubtasks | null => {
//     const task = tasks.find(t => t.id === id);
//     if (!task) return null;

//     const subtasks = getSubtasks(id);
//     const category = categories.find(c => c.id === task.categoryId);
//     const parent = task.parentTaskId ? tasks.find(t => t.id === task.parentTaskId) : undefined;

//     return {
//       ...task,
//       subtasks,
//       category,
//       parent
//     };
//   };

//   const getTodaysTasks = () => {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const tomorrow = new Date(today);
//     tomorrow.setDate(tomorrow.getDate() + 1);

//     return tasks.filter(task => {
//       if (!task.dueDate) return false;
//       const taskDate = new Date(task.dueDate);
//       return taskDate >= today && taskDate < tomorrow;
//     });
//   };

//   const getOverdueTasks = () => {
//     const now = new Date();
//     return tasks.filter(task => {
//       if (!task.dueDate || task.completed) return false;
//       return new Date(task.dueDate) < now;
//     });
//   };

//   return (
//     <TaskContext.Provider
//       value={{
//         tasks,
//         categories,
//         currentTask,
//         setCurrentTask,
//         addTask,
//         updateTask,
//         deleteTask,
//         duplicateTask,
//         toggleTaskComplete,
//         addCategory,
//         updateCategory,
//         deleteCategory,
//         getTasksByCategory,
//         getTaskWithSubtasks,
//         getSubtasks,
//         getTodaysTasks,
//         getOverdueTasks
//       }}
//     >
//       {children}
//     </TaskContext.Provider>
//   );
// }

// export function useTaskContext() {
//   const context = useContext(TaskContext);
//   if (!context) {
//     throw new Error('useTaskContext must be used within TaskProvider');
//   }
//   return context;
// }