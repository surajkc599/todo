/**
 * SubTask Routes
 * Endpoints for managing subtasks (individual items) within tasks
 */

import { Router, Request, Response, NextFunction } from 'express';
import { ApiResponse, SubTask, CreateSubTaskRequest } from '../types/index.js';
import * as subtaskService from '../services/subtaskService.js';

const router = Router({ mergeParams: true });

/**
 * Create a new subtask
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { listId } = req.params;
    const data: CreateSubTaskRequest = req.body;

    const subtask = await subtaskService.createSubTask(listId, data);

    const response: ApiResponse<SubTask> = { data: subtask };
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * Update a subtask
 */
router.patch('/:subTaskId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { listId, subTaskId } = req.params;
    const data: Partial<CreateSubTaskRequest> & { done?: boolean } = req.body;

    const subtask = await subtaskService.updateSubTask(listId, subTaskId, data);

    const response: ApiResponse<SubTask> = { data: subtask };
    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * Delete a subtask
 */
router.delete('/:subTaskId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { listId, subTaskId } = req.params;

    await subtaskService.deleteSubTask(listId, subTaskId);

    const response: ApiResponse<null> = {
      message: 'SubTask deleted successfully',
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
