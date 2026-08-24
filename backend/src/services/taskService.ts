/**
 * Task Service
 * Business logic for managing tasks (categories)
 * Database operations implemented with Prisma ORM
 */

import { Task, CreateTaskRequest } from '../types/index.js';
import { ApiError } from '../middleware/errorHandler.js';
import { sanitizeText } from '../utils/validation.js';
import prisma from './prismaClient.js';

/**
 * Create a new task in a list
 */
export async function createTask(listId: string, data: CreateTaskRequest): Promise<Task> {
  try {
    if (!listId || typeof listId !== 'string') {
      throw new ApiError(400, 'Invalid list ID');
    }

    // Verify list exists
    const list = await prisma.list.findUnique({ where: { id: listId } });
    if (!list) {
      throw new ApiError(404, 'List not found');
    }

    const sanitizedText = sanitizeText(data.text);
    const task = await prisma.task.create({
      data: {
        listId,
        text: sanitizedText,
        description: data.description || null,
        price: data.price || null,
      },
      include: { subtasks: true },
    });

    return {
      ...task,
      price: task.price ? Number(task.price) : null,
      subtasks: task.subtasks.map((st) => ({
        ...st,
        price: st.price ? Number(st.price) : null,
      })),
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Create task error:', error);
    throw new ApiError(500, 'Failed to create task');
  }
}

/**
 * Update a task
 */
export async function updateTask(
  listId: string,
  taskId: string,
  data: Partial<CreateTaskRequest>
): Promise<Task> {
  try {
    if (!listId || !taskId) {
      throw new ApiError(400, 'Invalid list ID or task ID');
    }

    // Verify task exists and belongs to list
    const task = await prisma.task.findFirst({
      where: { id: taskId, listId },
    });
    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    const updateData: Record<string, unknown> = {};
    if (data.text !== undefined) {
      updateData.text = sanitizeText(data.text);
    }
    if (data.description !== undefined) {
      updateData.description = data.description || null;
    }
    if (data.price !== undefined) {
      updateData.price = data.price || null;
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: { subtasks: true },
    });

    return {
      ...updated,
      price: updated.price ? Number(updated.price) : null,
      subtasks: updated.subtasks.map((st) => ({
        ...st,
        price: st.price ? Number(st.price) : null,
      })),
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Update task error:', error);
    throw new ApiError(500, 'Failed to update task');
  }
}

/**
 * Delete a task (cascade deletes subtasks)
 */
export async function deleteTask(listId: string, taskId: string): Promise<void> {
  try {
    if (!listId || !taskId) {
      throw new ApiError(400, 'Invalid list ID or task ID');
    }

    // Verify task exists and belongs to list
    const task = await prisma.task.findFirst({
      where: { id: taskId, listId },
    });
    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    await prisma.task.delete({ where: { id: taskId } });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Delete task error:', error);
    throw new ApiError(500, 'Failed to delete task');
  }
}
