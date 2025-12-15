"use client";
import {
  sampleMainTasks,
  sampleScheduledTasks,
  sampleSubTasks,
  sampleUnscheduledTasks,
} from "@/data/dummy";
import {
  MainTask,
  SubTask,
  ScheduledTask,
  UnscheduledTask,
  TaskContextProps,
} from "@/types/task";
import { createContext, useState, useEffect, useContext } from "react";
// import { createContext } from "vm";

const TaskContext = createContext<TaskContextProps | undefined>(undefined);

// Task Provider Component
export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [mainTasks, setMainTasks] = useState<MainTask[]>([]);
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [unscheduledTasks, setUnscheduledTasks] = useState<UnscheduledTask[]>(
    []
  );

  // Initialize with sample data
  useEffect(() => {
    setMainTasks(sampleMainTasks);
    setSubTasks(sampleSubTasks);
    setScheduledTasks(sampleScheduledTasks);
    setUnscheduledTasks(sampleUnscheduledTasks);
  }, []);
  // useEffect(() => {
  //   localStorage.setItem("nextnote-mainTasks", JSON.stringify(mainTasks));
  // }, [mainTasks]);
  // useEffect(() => {
  //   localStorage.setItem("nextnote-subTasks", JSON.stringify(subTasks));
  // }, [subTasks]);
  // useEffect(() => {
    
  //   localStorage.setItem(
  //     "nextnote-scheduledTasks",
  //     JSON.stringify(scheduledTasks)
  //   );
  // }, [scheduledTasks]);
  // useEffect(() => {
  //   localStorage.setItem(
  //     "nextnote-unscheduledTasks",
  //     JSON.stringify(unscheduledTasks)
  //   );
  // }, [unscheduledTasks]);

  const addMainTask = (
    taskData: Omit<MainTask, "id" | "createdAt" | "updatedAt">
  ) => {
    const newTask: MainTask = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setMainTasks((prev) => [...prev, newTask]);
  };

  const addSubTask = (
    taskData: Omit<SubTask, "id" | "createdAt" | "updatedAt">
  ) => {
    const newTask: SubTask = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSubTasks((prev) => [...prev, newTask]);
  };

  const addScheduledTask = (
    taskData: Omit<ScheduledTask, "id" | "createdAt" | "updatedAt">
  ) => {
    const newTask: ScheduledTask = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setScheduledTasks((prev) => [...prev, newTask]);
  };

  const addUnscheduledTask = (
    taskData: Omit<UnscheduledTask, "id" | "createdAt" | "updatedAt">
  ) => {
    const newTask: UnscheduledTask = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setUnscheduledTasks((prev) => [...prev, newTask]);
  };

  const toggleSubTask = (id: string) => {
    setSubTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              lastCompleted: new Date(),
              updatedAt: new Date(),
            }
          : task
      )
    );
  };

  const toggleUnscheduledTask = (id: string) => {
    setUnscheduledTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              lastCompleted: new Date(),
              updatedAt: new Date(),
            }
          : task
      )
    );
  };

  const completeScheduledTask = (id: string) => {
    setScheduledTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          const nextDue = new Date();
          switch (task.frequency) {
            case "daily":
              nextDue.setDate(nextDue.getDate() + 1);
              break;
            case "weekly":
              nextDue.setDate(nextDue.getDate() + 7);
              break;
            case "monthly":
              nextDue.setMonth(nextDue.getMonth() + 1);
              break;
            case "yearly":
              nextDue.setFullYear(nextDue.getFullYear() + 1);
              break;
          }
          return {
            ...task,
            lastCompleted: new Date(),
            nextDue,
            updatedAt: new Date(),
          };
        }
        return task;
      })
    );
  };

  const deleteMainTask = (id: string) => {
    setMainTasks((prev) => prev.filter((task) => task.id !== id));
    setSubTasks((prev) => prev.filter((task) => task.mainTaskId !== id));
  };

  const deleteSubTask = (id: string) => {
    setSubTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const deleteScheduledTask = (id: string) => {
    setScheduledTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const deleteUnscheduledTask = (id: string) => {
    setUnscheduledTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const getSubTasksForMain = (mainTaskId: string) => {
    return subTasks.filter((task) => task.mainTaskId === mainTaskId);
  };

  const getScheduledTasksByFrequency = (frequency: string) => {
    return scheduledTasks.filter((task) => task.frequency === frequency);
  };
  const addSubTaskToSubTask = (
    taskData: Omit<SubTask, "id" | "createdAt" | "updatedAt">
  ) => {
    const newTask: SubTask = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSubTasks((prev) => [...prev, newTask]);
  };

  const getSubTasksForSubTask = (parentSubTaskId: string) => {
    return subTasks.filter((task) => task.parentSubTaskId === parentSubTaskId);
  };

  const deleteSubTaskAndChildren = (id: string) => {
    const deleteRecursively = (taskId: string) => {
      const children = subTasks.filter(
        (task) => task.parentSubTaskId === taskId
      );
      children.forEach((child) => deleteRecursively(child.id));
      setSubTasks((prev) => prev.filter((task) => task.id !== taskId));
    };
    deleteRecursively(id);
  };
  const updateSubTask = (
    id: string,
    updates: Partial<Omit<SubTask, "id" | "createdAt" | "updatedAt">>
  ) => {
    setSubTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task
      )
    );
  };
  return (
    <TaskContext.Provider
      value={{
        mainTasks,
        subTasks,
        scheduledTasks,
        unscheduledTasks,
        addSubTaskToSubTask,
        addMainTask,
        addSubTask,
        addScheduledTask,
        addUnscheduledTask,
        toggleSubTask,
        toggleUnscheduledTask,
        completeScheduledTask,
        deleteMainTask,
        deleteSubTask,
        deleteScheduledTask,
        deleteUnscheduledTask,
        getSubTasksForMain,
        getScheduledTasksByFrequency,
        getSubTasksForSubTask,
        deleteSubTaskAndChildren,
        updateSubTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTaskContext must be used within TaskProvider");
  }
  return context;
}
