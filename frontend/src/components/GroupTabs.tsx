import { useState, useEffect } from 'react';
import { Item } from '../types';
import { SubTaskItem } from './SubTaskItem';
import { AddSubTaskForm } from './AddSubTaskForm';

interface GroupTabsProps {
  group: Item;
  openItems: Item[];
  completedItems: Item[];
  onAddSubTask: (groupId: string) => void;
  onToggleItem: (itemId: string, done: boolean) => void;
  onDeleteItem: (itemId: string) => void;
  onUpdateItem: (itemId: string, text: string, price: number) => void;
  onRefresh: () => void;
  updatingItemId: string | null;
  isNewlyCreated?: boolean;
}

export function GroupTabs({
  group,
  openItems,
  completedItems,
  onAddSubTask,
  onToggleItem,
  onDeleteItem,
  onUpdateItem,
  onRefresh,
  updatingItemId,
  isNewlyCreated,
}: GroupTabsProps) {
  const [activeTab, setActiveTab] = useState<'open' | 'completed'>('open');
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('open')}
          className={`flex-1 px-4 py-3 font-medium text-sm transition-colors ${
            activeTab === 'open'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Open ({openItems.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 px-4 py-3 font-medium text-sm transition-colors ${
            activeTab === 'completed'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Completed ({completedItems.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white">
        {activeTab === 'open' && (
          <div>
            {openItems.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-500 text-sm">
                No open items. Start by adding an item.
              </div>
            ) : (
              <div>
                {openItems.map((item) => (
                  <SubTaskItem
                    key={item.id}
                    item={item}
                    onToggle={onToggleItem}
                    onDelete={onDeleteItem}
                    onUpdate={onUpdateItem}
                    isUpdating={updatingItemId === item.id}
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
                  groupId={group.id}
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
            {completedItems.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-500 text-sm">
                No purchased items yet.
              </div>
            ) : (
              <div>
                {completedItems.map((item) => (
                  <SubTaskItem
                    key={item.id}
                    item={item}
                    onToggle={onToggleItem}
                    onDelete={onDeleteItem}
                    onUpdate={onUpdateItem}
                    isUpdating={updatingItemId === item.id}
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
