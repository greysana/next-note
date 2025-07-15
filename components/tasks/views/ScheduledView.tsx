import { ArrowLeft, Plus } from "lucide-react";
import React from "react";
import ScheduledTaskItem from "../ScheduledTaskItem";
import { useTaskContext } from "@/hooks/TaskContext";

const ScheduledView = ({
  setSelectedFrequency,
  setShowNewScheduledTaskModal,
  setCurrentView,
}: {
  setSelectedFrequency: (
    frequency: "daily" | "weekly" | "monthly" | "yearly"
  ) => void;
  setShowNewScheduledTaskModal: (show: boolean) => void;
  setCurrentView: (
    view: "main" | "scheduled" | "unscheduled" | "category"
  ) => void;
}) => {
  const { completeScheduledTask, getScheduledTasksByFrequency } =
    useTaskContext();

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

export default ScheduledView;
