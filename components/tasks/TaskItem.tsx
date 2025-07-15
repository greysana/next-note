import { useTaskContext } from "@/hooks/TaskContext";
import { SubTask } from "@/types/task";
import { CheckCircle2, Circle, Clock, Plus, Trash2, Edit3 } from "lucide-react";
import React, { useState } from "react";
import SubtaskForm from "./SubtaskForm";
import EditTaskForm from "./EditTaskForm";

const TaskItem = ({
  task,
  onToggle,
  onDelete,
  level,
}: {
  task: SubTask;
  onToggle: () => void;
  onDelete: () => void;
  level: number;
}) => {
  const {
    getSubTasksForSubTask,
    toggleSubTask,
    deleteSubTaskAndChildren,
    addSubTaskToSubTask,
  } = useTaskContext();
  const [showAddSubTask, setShowAddSubTask] = useState(false);
  const [showSubTasks, setShowSubTasks] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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

  const formatDateTime = (dateTime: Date | string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  return (
    <div
      className={`${level > 0 ? "ml-8 border-l-2 border-gray-200 pl-4" : ""}`}
    >
      <div
        className={`bg-white rounded-lg border p-4 ${task.completed ? "opacity-60" : ""} ${isOverdue ? "border-red-200 bg-red-50" : "border-gray-200"}`}
      >
        {isEditing ? (
          <EditTaskForm
            task={task}
            onSave={() => setIsEditing(false)}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
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
                    {hasSubTasks && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {subTasks.length} subtask
                        {subTasks.length !== 1 ? "s" : ""}
                      </span>
                    )}
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
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-gray-400 hover:text-green-600 p-1"
                    title="Edit task"
                  >
                    <Edit3 className="w-4 h-4" />
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
              <div className="flex items-center gap-4 text-sm text-gray-500">
                {task.dueDate && (
                  <div className="flex items-center gap-1 mt-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span
                      className={`text-sm ${isOverdue ? "text-red-600 font-medium" : "text-gray-500"}`}
                    >
                      Due: {formatDateTime(task.dueDate).date} at{" "}
                      {formatDateTime(task.dueDate).time}
                    </span>
                    {isOverdue && (
                      <span className="text-xs text-red-600 font-medium">
                        OVERDUE
                      </span>
                    )}
                  </div>
                )}
                {task.lastCompleted && (
                  <span className="flex items-center gap-1 mt-2">
                    Last completed:{" "}
                    {new Date(task.lastCompleted).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
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
          <SubtaskForm
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
};

export default TaskItem;
