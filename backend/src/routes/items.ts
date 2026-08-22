/**
 * @swagger
 * tags:
 *   name: Items
 *   description: Todo item management endpoints
 */

/**
 * Item Routes
 * Endpoints for managing todo items within lists
 */

import { Router, Request, Response, NextFunction } from 'express';
import { ApiResponse, Item, CreateItemRequest, UpdateItemRequest } from '../types/index.js';
import * as itemService from '../services/itemService.js';
import { validateCreateItemRequest, validateUpdateItemRequest } from '../utils/validation.js';

const router = Router({ mergeParams: true }); // mergeParams to access :listId from parent router

/**
 * @swagger
 * /api/lists/{listId}/items:
 *   post:
 *     summary: Create a new item in a list
 *     tags: [Items]
 *     parameters:
 *       - name: listId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: Item description
 *               price:
 *                 type: number
 *                 description: Item cost (optional)
 *               done:
 *                 type: boolean
 *                 description: Is item completed
 *     responses:
 *       201:
 *         description: Item created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Item'
 *       400:
 *         description: Invalid input
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { listId } = req.params;
    const data: CreateItemRequest = req.body;

    // Validate input
    const validation = validateCreateItemRequest(data);
    if (!validation.isValid) {
      return res.status(400).json({
        error: validation.errors.join('; '),
      });
    }

    const item = await itemService.createItem(listId, data);

    const response: ApiResponse<Item> = {
      data: item,
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/lists/{listId}/items:
 *   get:
 *     summary: Get all items in a list
 *     tags: [Items]
 *     parameters:
 *       - name: listId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Items retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Item'
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { listId } = req.params;

    const items = await itemService.getItemsByListId(listId);

    const response: ApiResponse<Item[]> = {
      data: items,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/lists/{listId}/items/{itemId}:
 *   patch:
 *     summary: Update an item (text, price, done status)
 *     tags: [Items]
 *     parameters:
 *       - name: listId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: itemId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *               price:
 *                 type: number
 *               done:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Item updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Item'
 *   delete:
 *     summary: Delete an item
 *     tags: [Items]
 *     parameters:
 *       - name: listId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: itemId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Item deleted
 *       404:
 *         description: Item not found
 */
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { listId, id } = req.params;
    const data: UpdateItemRequest = req.body;

    // Validate input
    const validation = validateUpdateItemRequest(data);
    if (!validation.isValid) {
      return res.status(400).json({
        error: validation.errors.join('; '),
      });
    }

    const item = await itemService.updateItem(listId, id, data);

    const response: ApiResponse<Item> = {
      data: item,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { listId, id } = req.params;

    await itemService.deleteItem(listId, id);

    const response: ApiResponse<null> = {
      message: 'Item deleted successfully',
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
