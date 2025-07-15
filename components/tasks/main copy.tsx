"use client";
import React, { useState, createContext, useContext, useEffect } from "react";
import {
  //   Folder,
  Calendar,
  Clock,
  Plus,
  ArrowLeft,
  CheckCircle2,
  Circle,
  //   Star,
  //   MoreVertical,
  Trash2,
  //   Edit,
  Target,
  RotateCcw,
  //   Archive,
  X,
} from "lucide-react";
import {
  MainTask,
  ScheduledTask,
  SubTask,
  UnscheduledTask,
} from "@/types/task";

// Types

interface TaskContextProps {
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
}
const TaskContext = createContext<TaskContextProps | undefined>(undefined);

// Task Provider Component
function TaskProvider({ children }: { children: React.ReactNode }) {
  const [mainTasks, setMainTasks] = useState<MainTask[]>([]);
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [unscheduledTasks, setUnscheduledTasks] = useState<UnscheduledTask[]>(
    []
  );

  // Initialize with sample data
  useEffect(() => {
    const sampleMainTasks: MainTask[] = [
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

    const sampleSubTasks: SubTask[] = [
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

    const sampleScheduledTasks: ScheduledTask[] = [
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

    const sampleUnscheduledTasks: UnscheduledTask[] = [
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

    setMainTasks(sampleMainTasks);
    setSubTasks(sampleSubTasks);
    setScheduledTasks(sampleScheduledTasks);
    setUnscheduledTasks(sampleUnscheduledTasks);
  }, []);

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
          ? { ...task, completed: !task.completed, updatedAt: new Date() }
          : task
      )
    );
  };

  const toggleUnscheduledTask = (id: string) => {
    setUnscheduledTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed, updatedAt: new Date() }
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
  // Add these functions inside TaskProvider component, before the return statement

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
  return (
    <TaskContext.Provider
      value={{
        mainTasks,
        subTasks,
        scheduledTasks,
        unscheduledTasks,
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
        addSubTaskToSubTask,
        getSubTasksForSubTask,
        deleteSubTaskAndChildren,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

function useTaskContext() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTaskContext must be used within TaskProvider");
  }
  return context;
}
function SubTaskForm({
  mainTaskId,
  parentSubTaskId,
  onSubmit,
  onCancel,
}: {
  mainTaskId: string;
  parentSubTaskId?: string;
  onSubmit: (taskData: Omit<SubTask, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      mainTaskId,
      parentSubTaskId,
      title: title.trim(),
      description: description.trim() || undefined,
      completed: false,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      userId: "user1",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        placeholder="Subtask title"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        placeholder="Subtask description"
        required
      />

      <div className="flex gap-2">
        <select
          value={priority}
          onChange={(e) =>
            setPriority(e.target.value as "low" | "medium" | "high")
          }
          className="px-2 py-1 border border-gray-300 rounded text-sm"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded text-sm"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Add
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// Task Item Components
function TaskItem({
  task,
  onToggle,
  onDelete,
  level = 0,
}: {
  task: SubTask;
  onToggle: () => void;
  onDelete: () => void;
  level?: number;
}) {
  const {
    getSubTasksForSubTask,
    toggleSubTask,
    deleteSubTaskAndChildren,
    addSubTaskToSubTask,
  } = useTaskContext();
  const [showAddSubTask, setShowAddSubTask] = useState(false);
  const [showSubTasks, setShowSubTasks] = useState(false);

  const subTasks = getSubTasksForSubTask(task.id);
  const hasSubTasks = subTasks.length > 0;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  return (
    <div
      className={`${level > 0 ? "ml-8 border-l-2 border-gray-200 pl-4" : ""}`}
    >
      <div
        className={`bg-white rounded-lg border p-4 ${task.completed ? "opacity-60" : ""} ${isOverdue ? "border-red-200 bg-red-50" : "border-gray-200"}`}
      >
        <div className="flex items-start gap-3">
          <button onClick={onToggle} className="mt-1 flex-shrink-0">
            {task.completed ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {hasSubTasks && (
                    <button
                      onClick={() => setShowSubTasks(!showSubTasks)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showSubTasks ? "▼" : "▶"}
                    </button>
                  )}
                  <h3
                    className={`font-medium ${task.completed ? "line-through text-gray-500" : "text-gray-900"}`}
                  >
                    {task.title}
                  </h3>
                </div>
                {task.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {task.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => setShowAddSubTask(true)}
                  className="text-gray-400 hover:text-blue-600 p-1"
                  title="Add subtask"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}
                >
                  {task.priority}
                </span>
                <button
                  onClick={onDelete}
                  className="text-gray-400 hover:text-red-600 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {task.dueDate && (
              <div className="flex items-center gap-1 mt-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span
                  className={`text-sm ${isOverdue ? "text-red-600 font-medium" : "text-gray-500"}`}
                >
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </span>
                {isOverdue && (
                  <span className="text-xs text-red-600 font-medium">
                    OVERDUE
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subtasks */}
      {hasSubTasks && showSubTasks && (
        <div className="mt-2 space-y-2">
          {subTasks.map((subTask) => (
            <TaskItem
              key={subTask.id}
              task={subTask}
              onToggle={() => toggleSubTask(subTask.id)}
              onDelete={() => deleteSubTaskAndChildren(subTask.id)}
              level={level + 1}
            />
          ))}
        </div>
      )}

      {/* Add subtask form */}
      {showAddSubTask && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <SubTaskForm
            mainTaskId={task.mainTaskId}
            parentSubTaskId={task.id}
            onSubmit={(taskData) => {
              addSubTaskToSubTask(taskData);
              setShowAddSubTask(false);
            }}
            onCancel={() => setShowAddSubTask(false)}
          />
        </div>
      )}
    </div>
  );
}

function ScheduledTaskItem({
  task,
  onComplete,
}: {
  task: ScheduledTask;
  onComplete: () => void;
}) {
  const isDue = new Date(task.nextDue) <= new Date();
  const isOverdue = new Date(task.nextDue) < new Date();

  return (
    <div
      className={`bg-white rounded-lg border p-4 ${isDue ? "border-blue-200 bg-blue-50" : "border-gray-200"}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <RotateCcw className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-gray-900">{task.title}</h3>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                task.priority === "high"
                  ? "text-red-600 bg-red-50"
                  : task.priority === "medium"
                    ? "text-yellow-600 bg-yellow-50"
                    : "text-green-600 bg-green-50"
              }`}
            >
              {task.priority}
            </span>
          </div>

          {task.description && (
            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Next due: {new Date(task.nextDue).toLocaleDateString()}</span>
            {task.lastCompleted && (
              <span>
                Last completed:{" "}
                {new Date(task.lastCompleted).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isDue && (
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${
                isOverdue
                  ? "text-red-600 bg-red-100"
                  : "text-blue-600 bg-blue-100"
              }`}
            >
              {isOverdue ? "OVERDUE" : "DUE"}
            </span>
          )}
          <button
            onClick={onComplete}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
          >
            Complete
          </button>
        </div>
      </div>
    </div>
  );
}

function UnscheduledTaskItem({
  task,
  onToggle,
}: {
  task: UnscheduledTask;
  onToggle: () => void;
}) {
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 ${task.completed ? "opacity-60" : ""}`}
    >
      <div className="flex items-start gap-3">
        <button onClick={onToggle} className="mt-1 flex-shrink-0">
          {task.completed ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : (
            <Circle className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          )}
        </button>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3
                className={`font-medium ${task.completed ? "line-through text-gray-500" : "text-gray-900"}`}
              >
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
              )}
            </div>

            <span
              className={`text-xs px-2 py-1 rounded-full ${
                task.priority === "high"
                  ? "text-red-600 bg-red-50"
                  : task.priority === "medium"
                    ? "text-yellow-600 bg-yellow-50"
                    : "text-green-600 bg-green-50"
              }`}
            >
              {task.priority}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal Components
function NewMainTaskModal({
  onClose,
  colors,
}: {
  onClose: () => void;
  colors: string[];
}) {
  const { addMainTask } = useTaskContext();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState(colors[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addMainTask({
      title: title.trim(),
      description: description.trim() || undefined,
      color: selectedColor,
      userId: "user1",
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">New Task Category</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter category title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter description (optional)"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor === color
                      ? "border-gray-400"
                      : "border-gray-200"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NewSubTaskModal({
  mainTaskId,
  onClose,
}: {
  mainTaskId: string;
  onClose: () => void;
}) {
  const { addSubTask } = useTaskContext();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addSubTask({
      mainTaskId,
      title: title.trim(),
      description: description.trim() || undefined,
      completed: false,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      userId: "user1",
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">New Task</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter task title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter description (optional)"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value as "low" | "medium" | "high")
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NewScheduledTaskModal({
  frequency,
  onClose,
}: {
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  onClose: () => void;
}) {
  const { addScheduledTask } = useTaskContext();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const nextDue = new Date();
    switch (frequency) {
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

    addScheduledTask({
      title: title.trim(),
      description: description.trim() || undefined,
      frequency,
      priority,
      isActive: true,
      nextDue,
      userId: "user1",
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">New {frequency} Task</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter task title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter description (optional)"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value as "low" | "medium" | "high")
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NewUnscheduledTaskModal({ onClose }: { onClose: () => void }) {
  const { addUnscheduledTask } = useTaskContext();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addUnscheduledTask({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      completed: false,
      userId: "user1",
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">New Task</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter task title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter description (optional)"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value as "low" | "medium" | "high")
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App Component
function TaskManager() {
  const [currentView, setCurrentView] = useState<
    "main" | "scheduled" | "unscheduled" | "category"
  >("main");
  const [selectedMainTask, setSelectedMainTask] = useState<MainTask | null>(
    null
  );
  const [showNewMainTaskModal, setShowNewMainTaskModal] = useState(false);
  const [showNewSubTaskModal, setShowNewSubTaskModal] = useState(false);
  const [showNewScheduledTaskModal, setShowNewScheduledTaskModal] =
    useState(false);
  const [selectedFrequency, setSelectedFrequency] = useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >("daily");
  const [showNewUnscheduledTaskModal, setShowNewUnscheduledTaskModal] =
    useState(false);

  const {
    mainTasks,
    // subTasks,
    scheduledTasks,
    unscheduledTasks,
    toggleSubTask,
    toggleUnscheduledTask,
    completeScheduledTask,
    deleteMainTask,
    // deleteScheduledTask,
    // deleteUnscheduledTask,
    getSubTasksForMain,
    getScheduledTasksByFrequency,
    deleteSubTaskAndChildren,
  } = useTaskContext();

  const colors = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#F97316",
    "#06B6D4",
    "#84CC16",
    "#EC4899",
    "#6B7280",
  ];

  const renderMainView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Task Categories</h1>
        <button
          onClick={() => setShowNewMainTaskModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mainTasks.map((task) => {
          const taskSubTasks = getSubTasksForMain(task.id);
          const completedCount = taskSubTasks.filter(
            (st) => st.completed
          ).length;
          const totalCount = taskSubTasks.length;

          return (
            <div
              key={task.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedMainTask(task);
                setCurrentView("category");
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: task.color }}
                  />
                  <h3 className="font-semibold text-gray-900">{task.title}</h3>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMainTask(task.id);
                  }}
                  className="text-gray-400 hover:text-red-600 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {task.description && (
                <p className="text-gray-600 text-sm mb-4">{task.description}</p>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {completedCount}/{totalCount} completed
                </span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      backgroundColor: task.color,
                      width:
                        totalCount > 0
                          ? `${(completedCount / totalCount) * 100}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setCurrentView("scheduled")}
        >
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Scheduled Tasks</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Recurring tasks and habits
          </p>
          <div className="text-2xl font-bold text-blue-600">
            {
              scheduledTasks.filter((t) => new Date(t.nextDue) <= new Date())
                .length
            }
          </div>
          <p className="text-sm text-gray-500">due today</p>
        </div>

        <div
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setCurrentView("unscheduled")}
        >
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-6 h-6 text-green-600" />
            <h3 className="font-semibold text-gray-900">Quick Tasks</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">One-time tasks and ideas</p>
          <div className="text-2xl font-bold text-green-600">
            {unscheduledTasks.filter((t) => !t.completed).length}
          </div>
          <p className="text-sm text-gray-500">pending</p>
        </div>
      </div>
    </div>
  );

  const renderCategoryView = () => {
    if (!selectedMainTask) return null;

    const taskSubTasks = getSubTasksForMain(selectedMainTask.id);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentView("main")}
            className="text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div
              className="w-6 h-6 rounded-full"
              style={{ backgroundColor: selectedMainTask.color }}
            />
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedMainTask.title}
            </h1>
          </div>
        </div>

        {selectedMainTask.description && (
          <p className="text-gray-600">{selectedMainTask.description}</p>
        )}

        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
          <button
            onClick={() => setShowNewSubTaskModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>

        <div className="space-y-3">
          {taskSubTasks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No tasks yet. Add your first task to get started!</p>
            </div>
          ) : (
            // Replace the existing taskSubTasks.map section with:
            taskSubTasks
              .filter((task) => !task.parentSubTaskId) // Only show top-level tasks
              .map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={() => toggleSubTask(task.id)}
                  onDelete={() => deleteSubTaskAndChildren(task.id)}
                  level={0}
                />
              ))
          )}
        </div>
      </div>
    );
  };

  const renderScheduledView = () => {
    const frequencies: Array<"daily" | "weekly" | "monthly" | "yearly"> = [
      "daily",
      "weekly",
      "monthly",
      "yearly",
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentView("main")}
            className="text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Scheduled Tasks</h1>
        </div>

        {frequencies.map((frequency) => {
          const tasks = getScheduledTasksByFrequency(frequency);

          return (
            <div key={frequency} className="space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 capitalize">
                  {frequency} Tasks
                </h2>
                <button
                  onClick={() => {
                    setSelectedFrequency(frequency);
                    setShowNewScheduledTaskModal(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add {frequency}
                </button>
              </div>

              {tasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  <p>No {frequency} tasks yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <ScheduledTaskItem
                      key={task.id}
                      task={task}
                      onComplete={() => completeScheduledTask(task.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderUnscheduledView = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCurrentView("main")}
          className="text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Quick Tasks</h1>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-gray-600">One-time tasks and quick ideas</p>
        <button
          onClick={() => setShowNewUnscheduledTaskModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      <div className="space-y-3">
        {unscheduledTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No quick tasks yet. Add one to get started!</p>
          </div>
        ) : (
          unscheduledTasks.map((task) => (
            <UnscheduledTaskItem
              key={task.id}
              task={task}
              onToggle={() => toggleUnscheduledTask(task.id)}
            />
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {currentView === "main" && renderMainView()}
        {currentView === "category" && renderCategoryView()}
        {currentView === "scheduled" && renderScheduledView()}
        {currentView === "unscheduled" && renderUnscheduledView()}

        {showNewMainTaskModal && (
          <NewMainTaskModal
            onClose={() => setShowNewMainTaskModal(false)}
            colors={colors}
          />
        )}

        {showNewSubTaskModal && selectedMainTask && (
          <NewSubTaskModal
            mainTaskId={selectedMainTask.id}
            onClose={() => setShowNewSubTaskModal(false)}
          />
        )}

        {showNewScheduledTaskModal && (
          <NewScheduledTaskModal
            frequency={selectedFrequency}
            onClose={() => setShowNewScheduledTaskModal(false)}
          />
        )}

        {showNewUnscheduledTaskModal && (
          <NewUnscheduledTaskModal
            onClose={() => setShowNewUnscheduledTaskModal(false)}
          />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <TaskProvider>
      <TaskManager />
    </TaskProvider>
  );
}
