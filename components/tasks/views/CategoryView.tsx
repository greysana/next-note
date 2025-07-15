import { useTaskContext } from "@/hooks/TaskContext";
import { MainTask } from "@/types/task";
import {
  ArrowLeft,
  Plus,
  Target,
  Filter,
  Calendar,
  CheckSquare,
} from "lucide-react";
import React, { useState, useMemo } from "react";
import TaskItem from "../TaskItem";

const CategoryView = ({
  selectedMainTask,
  setCurrentView,
  setShowNewSubTaskModal,
}: {
  selectedMainTask: MainTask | null;
  setShowNewSubTaskModal: (show: boolean) => void;
  setCurrentView: (
    view: "main" | "scheduled" | "unscheduled" | "category"
  ) => void;
}) => {
  const { toggleSubTask, deleteSubTaskAndChildren, getSubTasksForMain } =
    useTaskContext();

  // Filter states
  const [showCompleted, setShowCompleted] = useState(true);
  const [dueDateFilter, setDueDateFilter] = useState<
    "all" | "today" | "tomorrow" | "week" | "overdue"
  >("all");
  const [showFilters, setShowFilters] = useState(false);

  // if (!selectedMainTask) return null;

  const taskSubTasks = useMemo(() => {
    if (!selectedMainTask) return [];
    return getSubTasksForMain(selectedMainTask.id);
  }, [selectedMainTask, getSubTasksForMain]);

  // Filter logic
  const filteredTasks = useMemo(() => {
    let filtered = taskSubTasks.filter((task) => !task.parentSubTaskId);

    // Filter by completion status
    if (!showCompleted) {
      filtered = filtered.filter((task) => !task.completed);
    }

    // Filter by due date
    if (dueDateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const weekFromNow = new Date(today);
      weekFromNow.setDate(weekFromNow.getDate() + 7);

      filtered = filtered.filter((task) => {
        if (!task.dueDate) return false;
        const taskDueDate = new Date(task.dueDate);
        const taskDueDateOnly = new Date(
          taskDueDate.getFullYear(),
          taskDueDate.getMonth(),
          taskDueDate.getDate()
        );

        switch (dueDateFilter) {
          case "today":
            return taskDueDateOnly.getTime() === today.getTime();
          case "tomorrow":
            return taskDueDateOnly.getTime() === tomorrow.getTime();
          case "week":
            return taskDueDateOnly >= today && taskDueDateOnly <= weekFromNow;
          case "overdue":
            return taskDueDate < now && !task.completed;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [taskSubTasks, showCompleted, dueDateFilter]);

  // Early return is now after all hook calls
  if (!selectedMainTask) return null;

  const getFilterButtonClass = (isActive: boolean) =>
    `px-3 py-1 rounded-full text-sm ${
      isActive
        ? "bg-blue-600 text-white"
        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`;
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
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Tasks ({filteredTasks.length})
          </h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
        <button
          onClick={() => setShowNewSubTaskModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-gray-600" />
              <label className="text-sm font-medium text-gray-700">
                Show completed tasks
              </label>
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                className="ml-2"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-600" />
              <label className="text-sm font-medium text-gray-700">
                Due date filter:
              </label>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setDueDateFilter("all")}
                className={getFilterButtonClass(dueDateFilter === "all")}
              >
                All
              </button>
              <button
                onClick={() => setDueDateFilter("today")}
                className={getFilterButtonClass(dueDateFilter === "today")}
              >
                Today
              </button>
              <button
                onClick={() => setDueDateFilter("tomorrow")}
                className={getFilterButtonClass(dueDateFilter === "tomorrow")}
              >
                Tomorrow
              </button>
              <button
                onClick={() => setDueDateFilter("week")}
                className={getFilterButtonClass(dueDateFilter === "week")}
              >
                This Week
              </button>
              <button
                onClick={() => setDueDateFilter("overdue")}
                className={getFilterButtonClass(dueDateFilter === "overdue")}
              >
                Overdue
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>
              {taskSubTasks.length === 0
                ? "No tasks yet. Add your first task to get started!"
                : "No tasks match your current filters."}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
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

export default CategoryView;
