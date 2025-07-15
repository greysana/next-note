import { ScheduledTask } from '@/types/task';
import { RotateCcw } from 'lucide-react';
import React from 'react'

const ScheduledTaskItem = ({ task, onComplete }: {
  task: ScheduledTask;
  onComplete: () => void;
}) => {
const isDue = new Date(task.nextDue) <= new Date();
  const isOverdue = new Date(task.nextDue) < new Date();

  return (
    <div className={`bg-white rounded-lg border p-4 ${isDue ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <RotateCcw className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-gray-900">{task.title}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${
              task.priority === 'high' ? 'text-red-600 bg-red-50' :
              task.priority === 'medium' ? 'text-yellow-600 bg-yellow-50' :
              'text-green-600 bg-green-50'
            }`}>
              {task.priority}
            </span>
          </div>
          
          {task.description && (
            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Next due: {new Date(task.nextDue).toLocaleDateString()}</span>
            {task.lastCompleted && (
              <span>Last completed: {new Date(task.lastCompleted).toLocaleDateString()}</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isDue && (
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              isOverdue ? 'text-red-600 bg-red-100' : 'text-blue-600 bg-blue-100'
            }`}>
              {isOverdue ? 'OVERDUE' : 'DUE'}
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

export default ScheduledTaskItem