import React from "react";
import UnScheduledTaskItem from "../UnscheduledTaskItem";
import { ArrowLeft, Plus, Target } from "lucide-react";
import { useTaskContext } from "@/hooks/TaskContext";

const UnscheduledView = ({
  setCurrentView,
  setShowNewUnscheduledTaskModal,
}: {
  setShowNewUnscheduledTaskModal: (show: boolean) => void;
  setCurrentView: (
    view: "main" | "scheduled" | "unscheduled" | "category"
  ) => void;
}) => {
  const { unscheduledTasks, toggleUnscheduledTask } = useTaskContext();

  return (
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
            <UnScheduledTaskItem
              key={task.id}
              task={task}
              onToggle={() => toggleUnscheduledTask(task.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default UnscheduledView;
