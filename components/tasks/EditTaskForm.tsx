import { useTaskContext } from "@/hooks/TaskContext";
import { SubTask } from "@/types/task";
import React, { useState } from "react";

const EditTaskForm = ({
  task,
  onSave,
  onCancel,
}: {
  task: SubTask;
  onSave: () => void;
  onCancel: () => void;
}) => {
  const { updateSubTask } = useTaskContext();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState<"low" | "medium" | "high">(task.priority);
  
  // Format date and time for inputs
  const formatForDateTimeInput = (date: Date | string | undefined) => {
    if (!date) return { date: "", time: "" };
    const d = new Date(date);
    const dateStr = d.toISOString().split('T')[0];
    const timeStr = d.toTimeString().slice(0, 5);
    return { date: dateStr, time: timeStr };
  };

  const { date: dueDateStr, time: dueTimeStr } = formatForDateTimeInput(task.dueDate);
  const [dueDate, setDueDate] = useState(dueDateStr);
  const [dueTime, setDueTime] = useState(dueTimeStr);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let dueDateTimeValue: Date | undefined = undefined;
    if (dueDate) {
      if (dueTime) {
        dueDateTimeValue = new Date(`${dueDate}T${dueTime}`);
      } else {
        dueDateTimeValue = new Date(dueDate);
      }
    }

    updateSubTask(task.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDateTimeValue,
    });

    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
        placeholder="Task title"
        required
      />
      
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        placeholder="Task description"
        rows={2}
      />
      
      <div className="flex gap-2 flex-wrap">
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
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
        
        <input
          type="time"
          value={dueTime}
          onChange={(e) => setDueTime(e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded text-sm"
          disabled={!dueDate}
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
        >
          Save
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
};

export default EditTaskForm;