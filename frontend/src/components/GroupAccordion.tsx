import { useState } from 'react';
import { Item } from '../types';
import { GroupTabs } from './GroupTabs';
import { ConfirmDialog } from './ConfirmDialog';

interface GroupAccordionProps {
  group: Item;
  onAddSubTask: (groupId: string) => void;
  onToggleItem: (itemId: string, done: boolean) => void;
  onDeleteItem: (itemId: string) => void;
  onUpdateItem: (itemId: string, text: string, price: number) => void;
  onRefresh: () => void;
  updatingItemId: string | null;
  isNewlyCreated?: boolean;
}

export function GroupAccordion({
  group,
  onAddSubTask,
  onToggleItem,
  onDeleteItem,
  onUpdateItem,
  onRefresh,
  updatingItemId,
  isNewlyCreated,
}: GroupAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const subItems = group.items || [];
  const openItems = subItems.filter((item) => !item.done);
  const completedItems = subItems.filter((item) => item.done);

  // Calculate spent amount from sub-tasks
  const spent = subItems.reduce((sum, item) => sum + (item.price || 0), 0);
  const budget = group.price || 0;
  const remaining = budget - spent;

  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetValue, setBudgetValue] = useState(budget.toString());

  const handleDeleteGroup = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteDialog(false);
    onDeleteItem(group.id);
  };

  const handleSaveBudget = () => {
    const newBudget = parseFloat(budgetValue) || 0;
    onUpdateItem(group.id, group.text, newBudget);
    setIsEditingBudget(false);
  };

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
        {/* Accordion Header */}
        <div className="flex items-center justify-between px-4 py-4 bg-slate-100 hover:bg-slate-150 transition-colors group">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-3 flex-1 text-left"
          >
            <span className={`text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
            <h3 className="text-lg font-semibold text-slate-900">
              {group.text}
              <span className="text-sm text-slate-500 ml-2">({subItems.length})</span>
            </h3>
          </button>

          {/* Budget Info */}
          <div className="flex items-center gap-4 mr-4">
            {isEditingBudget ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Budget:</span>
                <input
                  type="number"
                  value={budgetValue}
                  onChange={(e) => setBudgetValue(e.target.value)}
                  className="w-20 px-2 py-1 border border-slate-300 rounded text-sm"
                  autoFocus
                  step="0.01"
                />
                <button
                  onClick={handleSaveBudget}
                  className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setBudgetValue(budget.toString());
                    setIsEditingBudget(false);
                  }}
                  className="px-2 py-1 bg-slate-300 text-slate-700 rounded text-xs hover:bg-slate-400"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="text-sm text-slate-700 flex items-center gap-2">
                <span className="font-semibold">
                  Budget: €{budget.toFixed(2)} | Spent: €{spent.toFixed(2)}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingBudget(true);
                  }}
                  className="px-2 py-1 text-slate-600 hover:text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Edit budget"
                >
                  ✎
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleDeleteGroup}
            className="px-2 py-1 text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Delete group"
          >
            ✕
          </button>
        </div>

        {/* Accordion Content */}
        {isExpanded && (
          <div className="border-t border-slate-200 bg-slate-50">
            <GroupTabs
              group={group}
              openItems={openItems}
              completedItems={completedItems}
              onAddSubTask={onAddSubTask}
              onToggleItem={onToggleItem}
              onDeleteItem={onDeleteItem}
              onUpdateItem={onUpdateItem}
              onRefresh={onRefresh}
              updatingItemId={updatingItemId}
              isNewlyCreated={isNewlyCreated}
            />
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Category"
        message={`Delete "${group.text}" and all its items? This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </>
  );
}
