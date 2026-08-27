import { Task } from '../../../shared/types';
import { GroupAccordion } from './GroupAccordion';

interface GroupListProps {
  tasks: Task[];
  onToggleSubTask: (subTaskId: string, done: boolean) => void;
  onDeleteSubTask: (subTaskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateSubTask: (subTaskId: string, text: string, price: number) => void;
  onRefresh: () => void;
  updatingItemId: string | null;
}

export function GroupList({
  tasks,
  onToggleSubTask,
  onDeleteSubTask,
  onDeleteTask,
  onUpdateSubTask,
  onRefresh,
  updatingItemId,
}: GroupListProps) {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {tasks.map((task) => (
        <GroupAccordion
          key={task.id}
          task={task}
          onToggleSubTask={onToggleSubTask}
          onDeleteSubTask={onDeleteSubTask}
          onDeleteTask={onDeleteTask}
          onUpdateSubTask={onUpdateSubTask}
          onRefresh={onRefresh}
          updatingItemId={updatingItemId}
        />
      ))}
    </div>
  );
}
