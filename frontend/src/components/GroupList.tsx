import { Item } from '../types';
import { GroupAccordion } from './GroupAccordion';

interface GroupListProps {
  groups: Item[];
  onAddSubTask: (groupId: string) => void;
  onToggleItem: (itemId: string, done: boolean) => void;
  onDeleteItem: (itemId: string) => void;
  onUpdateItem: (itemId: string, text: string, price: number) => void;
  onRefresh: () => void;
  updatingItemId: string | null;
  newlyCreatedGroupId?: string | null;
}

export function GroupList({
  groups,
  onAddSubTask,
  onToggleItem,
  onDeleteItem,
  onUpdateItem,
  onRefresh,
  updatingItemId,
  newlyCreatedGroupId,
}: GroupListProps) {
  if (groups.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <GroupAccordion
          key={group.id}
          group={group}
          onAddSubTask={onAddSubTask}
          onToggleItem={onToggleItem}
          onDeleteItem={onDeleteItem}
          onUpdateItem={onUpdateItem}
          onRefresh={onRefresh}
          updatingItemId={updatingItemId}
          isNewlyCreated={newlyCreatedGroupId === group.id}
        />
      ))}
    </div>
  );
}
