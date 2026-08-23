/**
 * List Service
 * Business logic for managing todo lists
 * Database operations implemented with Prisma ORM
 */

import { List, Item, CreateListRequest } from '../types/index.js';
import { ApiError } from '../middleware/errorHandler.js';
import prisma from './prismaClient.js';

/**
 * Organize flat items array into hierarchical structure
 * Groups (parentItemId = null) contain their sub-items
 */
function organizeItems(flatItems: Item[]): Item[] {
  const groups: Item[] = [];
  const itemMap = new Map<string, Item>();

  // Create map of all items and convert prices
  flatItems.forEach((item) => {
    const isGroup = !item.parentItemId;
    itemMap.set(item.id, {
      ...item,
      price: item.price ? Number(item.price) : null,
      ...(isGroup && { items: [] }), // Only add items array to groups
    });
  });

  // Build hierarchy
  itemMap.forEach((item) => {
    if (item.parentItemId === null || item.parentItemId === undefined) {
      // This is a group (no parent)
      groups.push(item);
    } else {
      // This is a sub-task, add to parent's items array
      const parent = itemMap.get(item.parentItemId);
      if (parent) {
        if (!parent.items) {
          parent.items = [];
        }
        parent.items.push(item);
      }
    }
  });

  return groups;
}

/**
 * Create a new list
 * Returns the created list with auto-generated ID and timestamp
 * Items are organized hierarchically (groups contain sub-items)
 */
export async function createList(_data: CreateListRequest): Promise<List> {
  try {
    const list = await prisma.list.create({
      data: {},
      include: { items: true },
    });

    // Organize items hierarchically
    const organizedItems = organizeItems(list.items as Item[]);

    return {
      ...list,
      items: organizedItems,
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
 * Items are organized hierarchically (groups contain sub-items)
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

    // Organize items hierarchically
    const organizedItems = organizeItems(list.items as Item[]);

    return {
      ...list,
      items: organizedItems,
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
 * Also deletes all items in the list (cascade delete via database)
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

    // Delete the list (cascade delete handles items)
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
