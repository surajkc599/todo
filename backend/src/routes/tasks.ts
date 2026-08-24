/**
 * Task Routes
 * Endpoints for managing tasks (categories) within lists
 */

import { Router, Request, Response, NextFunction } from 'express';
import { ApiResponse, Task, CreateTaskRequest } from '../types/index.js';
import * as taskService from '../services/taskService.js';

const router = Router({ mergeParams: true });

/**
 * Create a new task
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { listId } = req.params;
    const data: CreateTaskRequest = req.body;

    const task = await taskService.createTask(listId, data);

    const response: ApiResponse<Task> = { data: task };
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * Update a task
 */
router.patch('/:taskId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { listId, taskId } = req.params;
    const data: Partial<CreateTaskRequest> = req.body;

    const task = await taskService.updateTask(listId, taskId, data);

    const response: ApiResponse<Task> = { data: task };
    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * Delete a task
 */
router.delete('/:taskId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { listId, taskId } = req.params;

    await taskService.deleteTask(listId, taskId);

    const response: ApiResponse<null> = {
      message: 'Task deleted successfully',
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
