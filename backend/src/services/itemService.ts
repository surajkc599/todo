/**
 * Item Service
 * Business logic for managing todo items within lists
 * Database operations implemented with Prisma ORM
 */

import { Item, CreateItemRequest, UpdateItemRequest } from '../types/index.js';
import { ApiError } from '../middleware/errorHandler.js';
import { sanitizeText } from '../utils/validation.js';
import prisma from './prismaClient.js';

/**
 * Create a new item in a list (group or sub-task)
 * Verifies list exists before creating item
 * If parentItemId provided, verifies parent item exists in same list
 * Returns created item with all fields populated
 */
export async function createItem(listId: string, data: CreateItemRequest): Promise<Item> {
  try {
    if (!listId || typeof listId !== 'string') {
      throw new ApiError(400, 'Invalid list ID');
    }

    // Verify list exists
    const list = await prisma.list.findUnique({ where: { id: listId } });
    if (!list) {
      throw new ApiError(404, 'List not found');
    }

    // If parentItemId provided, verify parent item exists in same list
    if (data.parentItemId) {
      const parentItem = await prisma.item.findFirst({
        where: { id: data.parentItemId, listId },
      });
      if (!parentItem) {
        throw new ApiError(404, 'Parent item not found in this list');
      }
    }

    const sanitizedText = sanitizeText(data.text);
    const item = await prisma.item.create({
      data: {
        listId,
        text: sanitizedText,
        done: data.done || false,
        price: data.price || null,
        parentItemId: data.parentItemId || null,
      },
    });

    // Convert Decimal price to number
    return {
      ...item,
      price: item.price ? Number(item.price) : null,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Create item error:', error);
    throw new ApiError(500, 'Failed to create item');
  }
}

/**
 * Get all items in a list
 * Returns empty array if list exists but has no items
 * Throws error if list does not exist
 */
export async function getItemsByListId(listId: string): Promise<Item[]> {
  try {
    if (!listId || typeof listId !== 'string') {
      throw new ApiError(400, 'Invalid list ID');
    }

    // Verify list exists
    const list = await prisma.list.findUnique({ where: { id: listId } });
    if (!list) {
      throw new ApiError(404, 'List not found');
    }

    const items = await prisma.item.findMany({
      where: { listId },
    });

    // Convert Decimal prices to numbers
    return items.map((item) => ({
      ...item,
      price: item.price ? Number(item.price) : null,
    }));
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Get items error:', error);
    throw new ApiError(500, 'Failed to retrieve items');
  }
}

/**
 * Update an item
 * Only updates fields that are provided
 * Verifies item belongs to list before updating
 * Returns updated item with all fields
 */
export async function updateItem(
  listId: string,
  itemId: string,
  data: UpdateItemRequest
): Promise<Item> {
  try {
    if (!listId || !itemId || typeof listId !== 'string' || typeof itemId !== 'string') {
      throw new ApiError(400, 'Invalid list ID or item ID');
    }

    // Verify item exists and belongs to list
    const existingItem = await prisma.item.findFirst({
      where: { id: itemId, listId },
    });
    if (!existingItem) {
      throw new ApiError(404, 'Item not found');
    }

    // Build update data with only provided fields
    const updateData: Record<string, string | boolean | number | null> = {};
    if (data.text !== undefined) updateData.text = sanitizeText(data.text);
    if (data.done !== undefined) updateData.done = data.done;
    if (data.price !== undefined) updateData.price = data.price;

    const updatedItem = await prisma.item.update({
      where: { id: itemId },
      data: updateData,
    });

    // Convert Decimal price to number
    return {
      ...updatedItem,
      price: updatedItem.price ? Number(updatedItem.price) : null,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Update item error:', error);
    throw new ApiError(500, 'Failed to update item');
  }
}

/**
 * Delete an item
 * Verifies item belongs to specified list before deleting
 * Throws 404 error if item not found
 */
export async function deleteItem(listId: string, itemId: string): Promise<void> {
  try {
    if (!listId || !itemId || typeof listId !== 'string' || typeof itemId !== 'string') {
      throw new ApiError(400, 'Invalid list ID or item ID');
    }

    // Verify item exists and belongs to list
    const existingItem = await prisma.item.findFirst({
      where: { id: itemId, listId },
    });
    if (!existingItem) {
      throw new ApiError(404, 'Item not found');
    }

    // Delete the item
    await prisma.item.delete({
      where: { id: itemId },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Delete item error:', error);
    throw new ApiError(500, 'Failed to delete item');
  }
}
