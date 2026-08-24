import { useState } from 'react';
import { Task } from '../types';
import { GroupTabs } from './GroupTabs';
import { ConfirmDialog } from './ConfirmDialog';
import { DescriptionModal } from './DescriptionModal';
import { DescriptionDisplay } from './DescriptionDisplay';
import { api } from '../utils/api';

interface GroupAccordionProps {
  task: Task;
  onToggleSubTask: (subTaskId: string, done: boolean) => void;
  onDeleteSubTask: (subTaskId: string) => void;
  onUpdateSubTask: (subTaskId: string, text: string, price: number) => void;
  onRefresh: () => void;
  updatingItemId: string | null;
}

export function GroupAccordion({
  task,
  onToggleSubTask,
  onDeleteSubTask,
  onUpdateSubTask,
  onRefresh,
  updatingItemId,
}: GroupAccordionProps) {
  const [showSubTasks, setShowSubTasks] = useState(false);
  const [showDescriptionText, setShowDescriptionText] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);

  const subTasks = task.subtasks || [];
  const openSubTasks = subTasks.filter((subTask) => !subTask.done);
  const completedSubTasks = subTasks.filter((subTask) => subTask.done);

  // Calculate spent amount from sub-tasks
  const spent = subTasks.reduce((sum, subTask) => sum + (subTask.price || 0), 0);
  const budget = task.price || 0;

  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetValue, setBudgetValue] = useState(budget.toString());

  const handleDeleteTask = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteDialog(false);
    onDeleteSubTask(task.id);
  };

  const handleSaveBudget = () => {
    const newBudget = parseFloat(budgetValue) || 0;
    onUpdateSubTask(task.id, task.text, newBudget);
    setIsEditingBudget(false);
  };

  const handleSaveDescription = async (description: string) => {
    try {
      await api.updateTask(task.listId, task.id, { description });
      onRefresh();
      setShowDescriptionModal(false);
    } catch (err) {
      console.error('Failed to save description:', err);
    }
  };

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-200">
        {/* Task Header Card */}
        <div>
          <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-slate-50 to-slate-100 group">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900">
                {task.text}
                <span className="text-xs font-semibold text-slate-500 ml-3 bg-slate-200 px-2 py-1 rounded-full">
                  {subTasks.length} items
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Created {new Date(task.createdAt).toLocaleDateString()} at {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {/* Budget Info */}
            <div className="flex items-center gap-6 mr-4">
              {isEditingBudget ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Budget:</span>
                  <input
                    type="number"
                    value={budgetValue}
                    onChange={(e) => setBudgetValue(e.target.value)}
                    className="w-24 px-3 py-2 border border-blue-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                    autoFocus
                    step="0.01"
                  />
                  <button
                    onClick={handleSaveBudget}
                    className="px-3 py-2 bg-blue-600 text-white text-sm rounded font-medium hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setBudgetValue(budget.toString());
                      setIsEditingBudget(false);
                    }}
                    className="px-3 py-2 bg-slate-300 text-slate-700 text-sm rounded font-medium hover:bg-slate-400"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-slate-600 font-semibold mb-1">BUDGET</p>
                    <p className="text-lg font-bold text-slate-900">€{budget.toFixed(2)}</p>
                  </div>
                  <div className="h-8 w-px bg-slate-300"></div>
                  <div className="text-right">
                    <p className="text-xs text-slate-600 font-semibold mb-1">SPENT</p>
                    <p className={`text-lg font-bold ${spent > budget ? 'text-red-600' : 'text-green-600'}`}>
                      €{spent.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditingBudget(true);
                    }}
                    className="px-3 py-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors opacity-0 group-hover:opacity-100"
                    title="Edit budget"
                  >
                    ✎
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDescriptionModal(true);
              }}
              className="px-3 py-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors opacity-0 group-hover:opacity-100"
              title="Edit description"
            >
              📝
            </button>

            <button
              onClick={handleDeleteTask}
              className="px-3 py-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
              title="Delete category"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Description Card */}
        {task.description && (
          <div className="border-t border-slate-200">
            <button
              onClick={() => setShowDescriptionText(!showDescriptionText)}
              className="w-full px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-150 transition-colors flex items-center justify-between group"
            >
              <h4 className="font-semibold text-slate-900">Description</h4>
              <span className={`text-slate-400 text-lg transition-transform duration-200 ${showDescriptionText ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>

            {showDescriptionText && (
              <div className="px-6 py-4 border-t border-slate-200">
                <DescriptionDisplay description={task.description} />
              </div>
            )}
          </div>
        )}

        {/* Subtasks Card */}
        <div className="border-t border-slate-200">
          <button
            onClick={() => setShowSubTasks(!showSubTasks)}
            className="w-full px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-150 transition-colors flex items-center justify-between group"
          >
            <h4 className="font-semibold text-slate-900">Items</h4>
            <span className={`text-slate-400 text-lg transition-transform duration-200 ${showSubTasks ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {showSubTasks && (
            <div className="border-t border-slate-200">
              <GroupTabs
                task={task}
                openSubTasks={openSubTasks}
                completedSubTasks={completedSubTasks}
                onToggleSubTask={onToggleSubTask}
                onDeleteSubTask={onDeleteSubTask}
                onUpdateSubTask={onUpdateSubTask}
                onRefresh={onRefresh}
                updatingItemId={updatingItemId}
              />
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Category"
        message={`Delete "${task.text}" and all its items? This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />

      <DescriptionModal
        isOpen={showDescriptionModal}
        taskText={task.text}
        currentDescription={task.description || ''}
        onSave={handleSaveDescription}
        onCancel={() => setShowDescriptionModal(false)}
      />
    </>
  );
}
