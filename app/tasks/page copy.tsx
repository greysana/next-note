// "use client";
// import { useState } from 'react';
// import { Plus, Calendar, Tag, Clock, Star, MoreVertical, Trash2, Copy, Edit } from 'lucide-react';
// import { useTaskContext } from '@/hooks/TaskContext';

// export default function TasksPage() {
//   const {
//     tasks,
//     categories,
//     currentTask,
//     setCurrentTask,
//     addTask,
//     toggleTaskComplete,
//     deleteTask,
//     duplicateTask,
//     getTasksByCategory,
//     getTaskWithSubtasks,
//     getSubtasks
//   } = useTaskContext();

//   const [showNewTaskForm, setShowNewTaskForm] = useState(false);
//   const [selectedCategory, setSelectedCategory] = useState<string | null>('general');
//   const [newTaskData, setNewTaskData] = useState({
//     title: '',
//     description: '',
//     priority: 'medium' as 'low' | 'medium' | 'high',
//     dueDate: '',
//     categoryId: 'general'
//   });

//   const handleAddTask = () => {
//     if (!newTaskData.title.trim()) return;

//     addTask({
//       title: newTaskData.title,
//       description: newTaskData.description,
//       priority: newTaskData.priority,
//       dueDate: newTaskData.dueDate ? new Date(newTaskData.dueDate) : undefined,
//       categoryId: newTaskData.categoryId,
//       userId: 'default-user'
//     });

//     // Reset form
//     setNewTaskData({
//       title: '',
//       description: '',
//       priority: 'medium',
//       dueDate: '',
//       categoryId: 'general'
//     });
//     setShowNewTaskForm(false);
//   };

//   const handleTaskClick = (taskId: string) => {
//     const taskWithSubtasks = getTaskWithSubtasks(taskId);
//     setCurrentTask(taskWithSubtasks);
//   };

//   const getPriorityColor = (priority: string) => {
//     switch (priority) {
//       case 'high': return 'text-red-500';
//       case 'medium': return 'text-yellow-500';
//       case 'low': return 'text-green-500';
//       default: return 'text-gray-500';
//     }
//   };

//   const formatDate = (date: Date) => {
//     return new Intl.DateTimeFormat('en-US', {
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     }).format(date);
//   };

//   const isOverdue = (dueDate: Date) => {
//     return new Date() > dueDate;
//   };

//   const currentCategoryTasks = getTasksByCategory(selectedCategory);

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center py-6">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
//               <p className="text-gray-600 mt-1">Organize and track your tasks</p>
//             </div>
//             <button
//               onClick={() => setShowNewTaskForm(true)}
//               className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
//             >
//               <Plus className="w-4 h-4" />
//               New Task
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
//           {/* Sidebar - Categories */}
//           <div className="lg:col-span-1">
//             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//               <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
//               <div className="space-y-2">
//                 {categories.map(category => {
//                   const categoryTasks = getTasksByCategory(category.id);
//                   const completedCount = categoryTasks.filter(task => task.completed).length;
                  
//                   return (
//                     <button
//                       key={category.id}
//                       onClick={() => setSelectedCategory(category.id)}
//                       className={`w-full text-left p-3 rounded-md transition-colors ${
//                         selectedCategory === category.id
//                           ? 'bg-blue-50 border-blue-200 border'
//                           : 'hover:bg-gray-50'
//                       }`}
//                     >
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-3">
//                           <div
//                             className="w-3 h-3 rounded-full"
//                             style={{ backgroundColor: category.color }}
//                           />
//                           <span className="font-medium text-gray-900">{category.name}</span>
//                         </div>
//                         <span className="text-sm text-gray-500">
//                           {completedCount}/{categoryTasks.length}
//                         </span>
//                       </div>
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>

//           {/* Main Content - Tasks List */}
//           <div className="lg:col-span-2">
//             <div className="bg-white rounded-lg shadow-sm border border-gray-200">
//               <div className="p-6 border-b border-gray-200">
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   {categories.find(c => c.id === selectedCategory)?.name || 'All Tasks'}
//                 </h2>
//               </div>

//               <div className="p-6">
//                 {currentCategoryTasks.length === 0 ? (
//                   <div className="text-center py-12">
//                     <div className="text-gray-400 mb-4">
//                       <Calendar className="w-12 h-12 mx-auto" />
//                     </div>
//                     <p className="text-gray-500">No tasks in this category yet.</p>
//                     <button
//                       onClick={() => setShowNewTaskForm(true)}
//                       className="text-blue-600 hover:text-blue-700 mt-2"
//                     >
//                       Create your first task
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="space-y-3">
//                     {currentCategoryTasks.map(task => {
//                       const subtasks = getSubtasks(task.id);
//                       const completedSubtasks = subtasks.filter(st => st.completed).length;
                      
//                       return (
//                         <div
//                           key={task.id}
//                           className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
//                         >
//                           <div className="flex items-start gap-3">
//                             <button
//                               onClick={() => toggleTaskComplete(task.id)}
//                               className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
//                                 task.completed
//                                   ? 'bg-blue-600 border-blue-600'
//                                   : 'border-gray-300 hover:border-blue-400'
//                               }`}
//                             >
//                               {task.completed && (
//                                 <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
//                                   <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                                 </svg>
//                               )}
//                             </button>

//                             <div className="flex-1 min-w-0">
//                               <div className="flex items-start justify-between">
//                                 <div className="flex-1">
//                                   <h3
//                                     className={`font-medium cursor-pointer hover:text-blue-600 ${
//                                       task.completed ? 'line-through text-gray-500' : 'text-gray-900'
//                                     }`}
//                                     onClick={() => handleTaskClick(task.id)}
//                                   >
//                                     {task.title}
//                                   </h3>
                                  
//                                   {task.description && (
//                                     <p className="text-sm text-gray-600 mt-1">{task.description}</p>
//                                   )}

//                                   <div className="flex items-center gap-4 mt-2">
//                                     {task.dueDate && (
//                                       <div className={`flex items-center gap-1 text-xs ${
//                                         isOverdue(task.dueDate) && !task.completed
//                                           ? 'text-red-600'
//                                           : 'text-gray-500'
//                                       }`}>
//                                         <Calendar className="w-3 h-3" />
//                                         {formatDate(task.dueDate)}
//                                       </div>
//                                     )}

//                                     <div className={`flex items-center gap-1 text-xs ${getPriorityColor(task.priority)}`}>
//                                       <Star className="w-3 h-3" />
//                                       {task.priority}
//                                     </div>

//                                     {subtasks.length > 0 && (
//                                       <div className="flex items-center gap-1 text-xs text-gray-500">
//                                         <Tag className="w-3 h-3" />
//                                         {completedSubtasks}/{subtasks.length} subtasks
//                                       </div>
//                                     )}
//                                   </div>
//                                 </div>

//                                 <div className="flex items-center gap-1 ml-4">
//                                   <button
//                                     onClick={() => duplicateTask(task.id)}
//                                     className="p-1 text-gray-400 hover:text-gray-600 rounded"
//                                     title="Duplicate task"
//                                   >
//                                     <Copy className="w-4 h-4" />
//                                   </button>
//                                   <button
//                                     onClick={() => deleteTask(task.id)}
//                                     className="p-1 text-gray-400 hover:text-red-600 rounded"
//                                     title="Delete task"
//                                   >
//                                     <Trash2 className="w-4 h-4" />
//                                   </button>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Right Sidebar - Task Details */}
//           <div className="lg:col-span-1">
//             {currentTask ? (
//               <TaskDetailsPanel task={currentTask} />
//             ) : (
//               <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//                 <div className="text-center text-gray-500">
//                   <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
//                   <p>Select a task to view details</p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* New Task Modal */}
//       {showNewTaskForm && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
//             <div className="p-6">
//               <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Task</h2>
              
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Task Title *
//                   </label>
//                   <input
//                     type="text"
//                     value={newTaskData.title}
//                     onChange={(e) => setNewTaskData(prev => ({ ...prev, title: e.target.value }))}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="Enter task title..."
//                     autoFocus
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Description
//                   </label>
//                   <textarea
//                     value={newTaskData.description}
//                     onChange={(e) => setNewTaskData(prev => ({ ...prev, description: e.target.value }))}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     rows={3}
//                     placeholder="Optional description..."
//                   />
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Priority
//                     </label>
//                     <select
//                       value={newTaskData.priority}
//                       onChange={(e) => setNewTaskData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     >
//                       <option value="low">Low</option>
//                       <option value="medium">Medium</option>
//                       <option value="high">High</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Category
//                     </label>
//                     <select
//                       value={newTaskData.categoryId}
//                       onChange={(e) => setNewTaskData(prev => ({ ...prev, categoryId: e.target.value }))}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     >
//                       {categories.map(category => (
//                         <option key={category.id} value={category.id}>
//                           {category.name}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Due Date
//                   </label>
//                   <input
//                     type="datetime-local"
//                     value={newTaskData.dueDate}
//                     onChange={(e) => setNewTaskData(prev => ({ ...prev, dueDate: e.target.value }))}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//               </div>

//               <div className="flex justify-end gap-3 mt-6">
//                 <button
//                   onClick={() => setShowNewTaskForm(false)}
//                   className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleAddTask}
//                   disabled={!newTaskData.title.trim()}
//                   className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-md transition-colors"
//                 >
//                   Create Task
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // Task Details Panel Component
// function TaskDetailsPanel({ task }: { task: any }) {
//   const { updateTask, addTask, toggleTaskComplete, deleteTask, getSubtasks } = useTaskContext();
//   const [showAddSubtask, setShowAddSubtask] = useState(false);
//   const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

//   const handleAddSubtask = () => {
//     if (!newSubtaskTitle.trim()) return;

//     addTask({
//       title: newSubtaskTitle,
//       description: '',
//       priority: 'medium',
//       categoryId: task.categoryId,
//       parentTaskId: task.id,
//       userId: 'default-user'
//     });

//     setNewSubtaskTitle('');
//     setShowAddSubtask(false);
//   };

//   const subtasks = getSubtasks(task.id);

//   return (
//     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//       <div className="mb-6">
//         <h2 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h2>
//         {task.description && (
//           <p className="text-gray-600 text-sm">{task.description}</p>
//         )}
//       </div>

//       <div className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
//           <select
//             value={task.priority}
//             onChange={(e) => updateTask(task.id, { priority: e.target.value as 'low' | 'medium' | 'high' })}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="low">Low</option>
//             <option value="medium">Medium</option>
//             <option value="high">High</option>
//           </select>
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
//           <input
//             type="datetime-local"
//             value={task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : ''}
//             onChange={(e) => updateTask(task.id, { 
//               dueDate: e.target.value ? new Date(e.target.value) : undefined 
//             })}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         <div>
//           <div className="flex items-center justify-between mb-2">
//             <label className="block text-sm font-medium text-gray-700">Subtasks</label>
//             <button
//               onClick={() => setShowAddSubtask(true)}
//               className="text-blue-600 hover:text-blue-700 text-sm"
//             >
//               <Plus className="w-4 h-4 inline mr-1" />
//               Add
//             </button>
//           </div>

//           <div className="space-y-2">
//             {subtasks.map(subtask => (
//               <div key={subtask.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
//                 <button
//                   onClick={() => toggleTaskComplete(subtask.id)}
//                   className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
//                     subtask.completed
//                       ? 'bg-blue-600 border-blue-600'
//                       : 'border-gray-300 hover:border-blue-400'
//                   }`}
//                 >
//                   {subtask.completed && (
//                     <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                     </svg>
//                   )}
//                 </button>
//                 <span className={`flex-1 text-sm ${
//                   subtask.completed ? 'line-through text-gray-500' : 'text-gray-700'
//                 }`}>
//                   {subtask.title}
//                 </span>
//                 <button
//                   onClick={() => deleteTask(subtask.id)}
//                   className="text-gray-400 hover:text-red-600"
//                 >
//                   <Trash2 className="w-3 h-3" />
//                 </button>
//               </div>
//             ))}

//             {showAddSubtask && (
//               <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
//                 <input
//                   type="text"
//                   value={newSubtaskTitle}
//                   onChange={(e) => setNewSubtaskTitle(e.target.value)}
//                   placeholder="Enter subtask title..."
//                   className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
//                   autoFocus
//                   onKeyPress={(e) => {
//                     if (e.key === 'Enter') {
//                       handleAddSubtask();
//                     }
//                   }}
//                 />
//                 <button
//                   onClick={handleAddSubtask}
//                   className="text-blue-600 hover:text-blue-700 text-sm px-2 py-1"
//                 >
//                   Add
//                 </button>
//                 <button
//                   onClick={() => {
//                     setShowAddSubtask(false);
//                     setNewSubtaskTitle('');
//                   }}
//                   className="text-gray-500 hover:text-gray-700 text-sm px-2 py-1"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             )}

//             {subtasks.length === 0 && !showAddSubtask && (
//               <p className="text-gray-500 text-sm italic">No subtasks yet</p>
//             )}
//           </div>
//         </div>

//         <div className="pt-4 border-t border-gray-200">
//           <div className="text-xs text-gray-500 space-y-1">
//             <p>Created: {task.createdAt.toLocaleDateString()}</p>
//             <p>Updated: {task.updatedAt.toLocaleDateString()}</p>
//             {task.timeSpent > 0 && (
//               <p>Time spent: {Math.floor(task.timeSpent / 60)}h {task.timeSpent % 60}m</p>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }