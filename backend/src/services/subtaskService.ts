/**
 * SubTask Service
 * Business logic for managing subtasks (individual items)
 * Database operations implemented with Prisma ORM
 */

import { SubTask, CreateSubTaskRequest } from '../types/index.js';
import { ApiError } from '../middleware/errorHandler.js';
import { sanitizeText } from '../utils/validation.js';
import prisma from './prismaClient.js';

/**
 * Create a new subtask under a task
 */
export async function createSubTask(listId: string, data: CreateSubTaskRequest): Promise<SubTask> {
  try {
    if (!listId || !data.taskId) {
      throw new ApiError(400, 'Invalid list ID or task ID');
    }

    // Verify task exists and belongs to list
    const task = await prisma.task.findFirst({
      where: { id: data.taskId, listId },
    });
    if (!task) {
      throw new ApiError(404, 'Task not found in this list');
    }

    const sanitizedText = sanitizeText(data.text);
    const subtask = await prisma.subTask.create({
      data: {
        taskId: data.taskId,
        text: sanitizedText,
        price: data.price || null,
        done: false,
      },
    });

    return {
      ...subtask,
      price: subtask.price ? Number(subtask.price) : null,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Create subtask error:', error);
    throw new ApiError(500, 'Failed to create subtask');
  }
}

/**
 * Update a subtask
 */
export async function updateSubTask(
  listId: string,
  subTaskId: string,
  data: Partial<CreateSubTaskRequest> & { done?: boolean }
): Promise<SubTask> {
  try {
    if (!listId || !subTaskId) {
      throw new ApiError(400, 'Invalid list ID or subtask ID');
    }

    // Verify subtask exists and belongs to list's task
    const subtask = await prisma.subTask.findFirst({
      where: {
        id: subTaskId,
        task: { listId },
      },
    });
    if (!subtask) {
      throw new ApiError(404, 'SubTask not found');
    }

    const updateData: Record<string, unknown> = {};
    if (data.text !== undefined) {
      updateData.text = sanitizeText(data.text);
    }
    if (data.price !== undefined) {
      updateData.price = data.price || null;
    }
    if (data.done !== undefined) {
      updateData.done = data.done;
    }

    const updated = await prisma.subTask.update({
      where: { id: subTaskId },
      data: updateData,
    });

    return {
      ...updated,
      price: updated.price ? Number(updated.price) : null,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Update subtask error:', error);
    throw new ApiError(500, 'Failed to update subtask');
  }
}

/**
 * Delete a subtask
 */
export async function deleteSubTask(listId: string, subTaskId: string): Promise<void> {
  try {
    if (!listId || !subTaskId) {
      throw new ApiError(400, 'Invalid list ID or subtask ID');
    }

    // Verify subtask exists and belongs to list's task
    const subtask = await prisma.subTask.findFirst({
      where: {
        id: subTaskId,
        task: { listId },
      },
    });
    if (!subtask) {
      throw new ApiError(404, 'SubTask not found');
    }

    await prisma.subTask.delete({ where: { id: subTaskId } });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Delete subtask error:', error);
    throw new ApiError(500, 'Failed to delete subtask');
  }
}
