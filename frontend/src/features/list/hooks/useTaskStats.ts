import { useMemo } from 'react';
import { Task } from '../../../shared/types';
import {
  calculateTotalCost,
  calculateCompletedItems,
  countAllItems,
  isTaskCompleted,
} from '../../../shared/utils/taskCalculations';

interface UseTaskStatsProps {
  allTasks: Task[];
  viewMode: 'active' | 'completed';
}

export function useTaskStats({ allTasks, viewMode }: UseTaskStatsProps) {
  return useMemo(() => {
    const filteredTasks = allTasks.filter(task =>
      viewMode === 'active' ? !isTaskCompleted(task) : isTaskCompleted(task)
    );

    return {
      filteredTasks,
      totalCost: calculateTotalCost(filteredTasks),
      completedItems: calculateCompletedItems(filteredTasks),
      totalItems: countAllItems(filteredTasks),
      activeTasks: allTasks.filter(t => !isTaskCompleted(t)).length,
      completedTasks: allTasks.filter(t => isTaskCompleted(t)).length,
    };
  }, [allTasks, viewMode]);
}
