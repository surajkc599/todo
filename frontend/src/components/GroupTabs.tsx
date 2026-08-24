import { useState } from 'react';
import { Task, SubTask } from '../types';
import { SubTaskItem } from './SubTaskItem';
import { AddSubTaskForm } from './AddSubTaskForm';

interface GroupTabsProps {
  task: Task;
  openSubTasks: SubTask[];
  completedSubTasks: SubTask[];
  onToggleSubTask: (subTaskId: string, done: boolean) => void;
  onDeleteSubTask: (subTaskId: string) => void;
  onUpdateSubTask: (subTaskId: string, text: string, price: number) => void;
  onRefresh: () => void;
  updatingItemId: string | null;
}

export function GroupTabs({
  task,
  openSubTasks,
  completedSubTasks,
  onToggleSubTask,
  onDeleteSubTask,
  onUpdateSubTask,
  onRefresh,
  updatingItemId,
}: GroupTabsProps) {
  const [activeTab, setActiveTab] = useState<'open' | 'completed'>('open');
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div>
      {/* Tabs - Modern Style */}
      <div className="flex border-b border-slate-200 bg-slate-50">
        <button
          onClick={() => setActiveTab('open')}
          className={`flex-1 px-4 py-4 font-semibold text-sm transition-all relative ${
            activeTab === 'open'
              ? 'text-blue-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <span>📋 Open</span>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
              {openSubTasks.length}
            </span>
          </div>
          {activeTab === 'open' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 px-4 py-4 font-semibold text-sm transition-all relative ${
            activeTab === 'completed'
              ? 'text-green-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <span>✓ Completed</span>
            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
              {completedSubTasks.length}
            </span>
          </div>
          {activeTab === 'completed' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full"></div>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white">
        {activeTab === 'open' && (
          <div>
            {openSubTasks.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-500 text-sm">
                No open items. Start by adding an item.
              </div>
            ) : (
              <div>
                {openSubTasks.map((subTask) => (
                  <SubTaskItem
                    key={subTask.id}
                    item={subTask}
                    onToggle={onToggleSubTask}
                    onDelete={onDeleteSubTask}
                    onUpdate={onUpdateSubTask}
                    isUpdating={updatingItemId === subTask.id}
                  />
                ))}
              </div>
            )}

            {/* Add Item Button */}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="w-full px-4 py-3 text-blue-600 hover:bg-slate-50 font-medium text-sm border-t border-slate-200 transition-colors"
            >
              + Add item
            </button>

            {/* Add Item Form */}
            {showAddForm && (
              <div className="px-4 py-4 border-t border-slate-200 bg-slate-50">
                <AddSubTaskForm
                  taskId={task.id}
                  onSubmit={() => {
                    setShowAddForm(false);
                    onRefresh();
                  }}
                  onCancel={() => setShowAddForm(false)}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'completed' && (
          <div>
            {completedSubTasks.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-500 text-sm">
                No completed items yet.
              </div>
            ) : (
              <div>
                {completedSubTasks.map((subTask) => (
                  <SubTaskItem
                    key={subTask.id}
                    item={subTask}
                    onToggle={onToggleSubTask}
                    onDelete={onDeleteSubTask}
                    onUpdate={onUpdateSubTask}
                    isUpdating={updatingItemId === subTask.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
