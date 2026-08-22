/**
 * List Service
 * Business logic for managing todo lists
 * Database operations implemented with Prisma ORM
 */

import { List, CreateListRequest } from '../types/index.js';
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
      include: { items: true },
    });

    // Convert Decimal prices to numbers
    return {
      ...list,
      items: list.items.map((item) => ({
        ...item,
        price: item.price ? Number(item.price) : null,
      })),
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
 * Get a list by ID with all its items
 * Returns null if list does not exist
 */
export async function getListById(listId: string): Promise<List | null> {
  try {
    if (!listId || typeof listId !== 'string') {
      throw new ApiError(400, 'Invalid list ID');
    }

    const list = await prisma.list.findUnique({
      where: { id: listId },
      include: { items: true },
    });

    if (!list) {
      return null;
    }

    // Convert Decimal prices to numbers
    return {
      ...list,
      items: list.items.map((item) => ({
        ...item,
        price: item.price ? Number(item.price) : null,
      })),
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Get list error:', error);
    throw new ApiError(500, 'Failed to retrieve list');
  }
}
