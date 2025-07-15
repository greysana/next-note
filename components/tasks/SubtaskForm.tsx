import { SubTask } from '@/types/task';
import React, { useState } from 'react'

const SubtaskForm = ({ 
  mainTaskId, 
  parentSubTaskId, 
  onSubmit, 
  onCancel 
}: {
  mainTaskId: string;
  parentSubTaskId?: string;
  onSubmit: (taskData: Omit<SubTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let dueDateTimeValue: Date | undefined = undefined;
    if (dueDate) {
      if (dueTime) {
        dueDateTimeValue = new Date(`${dueDate}T${dueTime}`);
      } else {
        // If only date is provided, set it to 9 AM as default
        dueDateTimeValue = new Date(`${dueDate}T09:00`);
      }
    }

    onSubmit({
      mainTaskId,
      parentSubTaskId,
      title: title.trim(),
      description: description.trim() || undefined,
      completed: false,
      priority,
      dueDate: dueDateTimeValue,
      userId: 'user1'
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
        placeholder="Subtask description (optional)"
        rows={2}
      />
      
      <div className="flex gap-2 flex-wrap">
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
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
          placeholder="Due date"
        />
        
        <input
          type="time"
          value={dueTime}
          onChange={(e) => setDueTime(e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded text-sm"
          disabled={!dueDate}
          placeholder="Due time"
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

export default SubtaskForm;