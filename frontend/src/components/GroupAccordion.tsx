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
  onDeleteTask: (taskId: string) => void;
  onUpdateSubTask: (subTaskId: string, text: string, price: number) => void;
  onRefresh: () => void;
  updatingItemId: string | null;
}

export function GroupAccordion({
  task,
  onToggleSubTask,
  onDeleteSubTask,
  onDeleteTask,
  onUpdateSubTask,
  onRefresh,
  updatingItemId,
}: GroupAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);

  const subTasks = task.subtasks || [];
  const openSubTasks = subTasks.filter((subTask) => !subTask.done);
  const completedSubTasks = subTasks.filter((subTask) => subTask.done);
  const allCompleted = subTasks.length > 0 && completedSubTasks.length === subTasks.length;

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
    onDeleteTask(task.id);
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
        {/* Clickable Header */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center justify-between px-6 py-5 bg-gradient-to-r transition-colors group cursor-pointer ${
            allCompleted
              ? 'from-green-50 to-green-100 hover:from-green-100 hover:to-green-150'
              : 'from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-150'
          }`}
        >
          <div className="flex items-center gap-4 flex-1">
            <span className={`text-slate-400 text-xl transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                {allCompleted && <span className="text-green-600">✓</span>}
                {task.text}
                <span className={`text-xs font-semibold ml-3 px-2 py-1 rounded-full ${
                  allCompleted
                    ? 'bg-green-200 text-green-700'
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  {subTasks.length} items
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Created {new Date(task.createdAt).toLocaleDateString()} at {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

            {/* Budget Info - Show if budget or spent > 0, or if editing */}
            {(budget > 0 || spent > 0 || isEditingBudget) && (
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
                </div>
              )}
            </div>
            )}

          {/* Edit Budget Button */}
          {!isEditingBudget && budget === 0 && spent === 0 && (
            <button
              onClick={(e) => {
                if (!navigator.onLine) return;
                e.stopPropagation();
                setIsEditingBudget(true);
              }}
              disabled={!navigator.onLine}
              className={`px-3 py-1 rounded transition-colors opacity-0 group-hover:opacity-100 ${
                navigator.onLine
                  ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200 cursor-pointer'
                  : 'text-slate-300 cursor-not-allowed'
              }`}
              title={!navigator.onLine ? 'Not supported offline' : 'Add budget'}
            >
              💰
            </button>
          )}

          {/* Description Button */}
          <button
            onClick={(e) => {
              if (!navigator.onLine) return;
              e.stopPropagation();
              setShowDescriptionModal(true);
            }}
            disabled={!navigator.onLine}
            className={`px-3 py-1 rounded transition-colors opacity-0 group-hover:opacity-100 ${
              navigator.onLine
                ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200 cursor-pointer'
                : 'text-slate-300 cursor-not-allowed'
            }`}
            title={!navigator.onLine ? 'Not supported offline' : 'Edit description'}
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

        {/* Expanded Content - Description + Items */}
        {isExpanded && (
          <div className="border-t border-slate-200">
            {/* Description Section */}
            {task.description && (
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                <h4 className="font-semibold text-slate-900 mb-2">Description</h4>
                <DescriptionDisplay description={task.description} />
              </div>
            )}

            {/* Items Section */}
            <div>
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
          </div>
        )}
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
