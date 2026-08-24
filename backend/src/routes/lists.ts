/**
 * @swagger
 * tags:
 *   name: Lists
 *   description: Todo list management endpoints
 */

/**
 * List Routes
 * Endpoints for managing todo lists
 */

import { Router, Request, Response, NextFunction } from 'express';
import { ApiResponse, List, CreateListRequest } from '../types/index.js';
import * as listService from '../services/listService.js';

const router = Router();

/**
 * @swagger
 * /api/lists:
 *   post:
 *     summary: Create a new list
 *     tags: [Lists]
 *     responses:
 *       201:
 *         description: List created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/List'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data: CreateListRequest = req.body;

    const list = await listService.createList(data);

    const response: ApiResponse<List> = {
      data: list,
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/lists/{id}:
 *   get:
 *     summary: Get a list by ID with paginated items
 *     tags: [Lists]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: List ID
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of items per page (max 100)
 *       - name: offset
 *         in: query
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of items to skip
 *     responses:
 *       200:
 *         description: List retrieved successfully with paginated items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     list:
 *                       $ref: '#/components/schemas/List'
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Item'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         limit:
 *                           type: integer
 *                         offset:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         hasMore:
 *                           type: boolean
 *       404:
 *         description: List not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const limit = Math.min(Math.max(1, parseInt(req.query.limit as string) || 5), 100);
    const offset = Math.max(0, parseInt(req.query.offset as string) || 0);

    const result = await listService.getListById(id, limit, offset);

    if (!result) {
      return res.status(404).json({
        error: 'List not found',
      });
    }

    const response: ApiResponse<any> = {
      data: {
        list: result.list,
        pagination: {
          limit,
          offset,
          total: result.total,
          hasMore: offset + limit < result.total,
        },
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/lists/{id}:
 *   delete:
 *     summary: Delete a list and all its items
 *     tags: [Lists]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: List ID
 *     responses:
 *       200:
 *         description: List deleted successfully
 *       404:
 *         description: List not found
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await listService.deleteList(id);

    const response: ApiResponse<null> = {
      message: 'List deleted successfully',
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
