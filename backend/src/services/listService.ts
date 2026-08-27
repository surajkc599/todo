/**
 * List Service
 * Business logic for managing todo lists
 * Database operations implemented with Prisma ORM
 */

import { List, Task, SubTask, CreateListRequest } from '../types/index.js';
import { ApiError } from '../middleware/errorHandler.js';
import prisma from './prismaClient.js';

/**
 * Create a new list
 * Returns the created list with auto-generated ID and timestamp
 */
export async function createList(_data: CreateListRequest): Promise<List> {
  try {
    const list = await prisma.list.create({
      data: {},
    });

    return {
      ...list,
      tasks: [],
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Create list error:', error);
    throw new ApiError(500, 'Failed to create list');
  }
}

/**
 * Get a list by ID with paginated tasks
 * Returns null if list does not exist
 * Supports pagination with limit/offset
 */
export async function getListById(
  listId: string,
  limit: number = 5,
  offset: number = 0
): Promise<{
  list: List;
  total: number;
} | null> {
  try {
    if (!listId || typeof listId !== 'string') {
      throw new ApiError(400, 'Invalid list ID');
    }

    // Validate pagination params
    const validLimit = Math.min(Math.max(1, limit), 100); // Min 1, max 100
    const validOffset = Math.max(0, offset);

    const list = await prisma.list.findUnique({
      where: { id: listId },
    });

    if (!list) {
      return null;
    }

    // Get paginated tasks and total count in parallel
    const [tasks, totalCount] = await prisma.$transaction([
      prisma.task.findMany({
        where: { listId },
        include: {
          subtasks: true,
        },
        orderBy: { createdAt: 'desc' },
        take: validLimit,
        skip: validOffset,
      }),
      prisma.task.count({
        where: { listId },
      }),
    ]);

    // Convert Decimal prices to numbers
    const tasksWithConvertedPrices: Task[] = tasks.map((task) => ({
      ...task,
      price: task.price ? Number(task.price) : null,
      subtasks: task.subtasks.map((subtask) => ({
        ...subtask,
        price: subtask.price ? Number(subtask.price) : null,
      })),
    }));

    return {
      list: { ...list, tasks: tasksWithConvertedPrices },
      total: totalCount,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Get list error:', error);
    throw new ApiError(500, 'Failed to retrieve list');
  }
}

/**
 * Delete a list by ID
 * Also deletes all tasks and subtasks (cascade delete via database)
 */
export async function deleteList(listId: string): Promise<void> {
  try {
    if (!listId || typeof listId !== 'string') {
      throw new ApiError(400, 'Invalid list ID');
    }

    // Verify list exists
    const list = await prisma.list.findUnique({ where: { id: listId } });
    if (!list) {
      throw new ApiError(404, 'List not found');
    }

    // Delete the list (cascade delete handles tasks and subtasks)
    await prisma.list.delete({
      where: { id: listId },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Delete list error:', error);
    throw new ApiError(500, 'Failed to delete list');
  }
}
