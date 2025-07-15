import { useTaskContext } from "@/hooks/TaskContext";
import { MainTask } from "@/types/task";
import {
  Plus,
  ArrowRight,
  Calendar,
  Target,
  FolderOpen,
  Clock,
  CheckCircle2,
} from "lucide-react";
import React from "react";
import Dashboard from "./Dashboard";

const MainView = ({
  setShowNewMainTaskModal,
  setSelectedMainTask,
  setCurrentView,
}: {
  setShowNewMainTaskModal: (show: boolean) => void;
  setSelectedMainTask: (task: MainTask | null) => void;
  setCurrentView: (
    view: "main" | "scheduled" | "unscheduled" | "category"
  ) => void;
}) => {
  const {
    mainTasks,
    scheduledTasks,
    unscheduledTasks,
    getSubTasksForMain,
    toggleUnscheduledTask,
    completeScheduledTask,
  } = useTaskContext();

  // Get top 5 main tasks (sorted by most recent or by progress)
  const topMainTasks = mainTasks.slice(0, 5);

  // Get top 5 scheduled tasks (sorted by next due date)
  const topScheduledTasks = scheduledTasks
    .filter((task) => task.isActive)
    .sort(
      (a, b) => new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime()
    )
    .slice(0, 5);

  // Get top 5 unscheduled tasks (sorted by priority and creation date)
  const topUnscheduledTasks = unscheduledTasks
    .filter((task) => !task.completed)
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 5);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 0) {
      return "Overdue";
    } else if (diffInHours < 24) {
      return "Today";
    } else if (diffInHours < 48) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

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

  return (
    <div className="space-y-8">
      <Dashboard />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">
            Manage your tasks and stay organized
          </p>
        </div>
        <button
          onClick={() => setShowNewMainTaskModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Category
        </button>
      </div>

      {/* Main Tasks Preview */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FolderOpen className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Task Categories
            </h2>
            <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
              {mainTasks.length}
            </span>
          </div>
          <button
            onClick={() => setCurrentView("category")}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium transition-colors"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {topMainTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>
                No categories yet. Create your first category to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {topMainTasks.map((task) => {
                const taskSubTasks = getSubTasksForMain(task.id);
                const completedCount = taskSubTasks.filter(
                  (st) => st.completed
                ).length;
                const totalCount = taskSubTasks.length;

                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedMainTask(task);
                      setCurrentView("category");
                    }}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: task.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-gray-500 truncate">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">
                        {completedCount}/{totalCount}
                      </span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
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
          )}
        </div>
      </div>

      {/* Scheduled Tasks Preview */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Scheduled Tasks
            </h2>
            <span className="bg-purple-100 text-purple-800 text-sm px-2 py-1 rounded-full">
              {
                scheduledTasks.filter(
                  (t) => t.isActive && new Date(t.nextDue) <= new Date()
                ).length
              }{" "}
              due
            </span>
          </div>
          <button
            onClick={() => setCurrentView("scheduled")}
            className="text-purple-600 hover:text-purple-700 flex items-center gap-1 text-sm font-medium transition-colors"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {topScheduledTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No scheduled tasks. Create recurring tasks and habits!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topScheduledTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => completeScheduledTask(task.id)}
                      className="text-purple-600 hover:text-purple-700 transition-colors"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-gray-500 truncate">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}
                    >
                      {task.priority}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      {formatDate(new Date(task.nextDue))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Unscheduled Tasks Preview */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Quick Tasks</h2>
            <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">
              {unscheduledTasks.filter((t) => !t.completed).length} pending
            </span>
          </div>
          <button
            onClick={() => setCurrentView("unscheduled")}
            className="text-green-600 hover:text-green-700 flex items-center gap-1 text-sm font-medium transition-colors"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {topUnscheduledTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No quick tasks. Add one-time tasks and ideas!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topUnscheduledTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => toggleUnscheduledTask(task.id)}
                      className="text-green-600 hover:text-green-700 transition-colors"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-gray-500 truncate">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainView;
