import { UnscheduledTask } from '@/types/task';
import { CheckCircle2, Circle } from 'lucide-react';
import React from 'react'

const UnScheduledTaskItem = ({ task, onToggle }: {
  task: UnscheduledTask;
  onToggle: () => void;
}) => {
return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${task.completed ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          className="mt-1 flex-shrink-0"
        >
          {task.completed ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : (
            <Circle className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          )}
        </button>
        
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
              )}
            </div>
            
            <span className={`text-xs px-2 py-1 rounded-full ${
              task.priority === 'high' ? 'text-red-600 bg-red-50' :
              task.priority === 'medium' ? 'text-yellow-600 bg-yellow-50' :
              'text-green-600 bg-green-50'
            }`}>
              {task.priority}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UnScheduledTaskItem