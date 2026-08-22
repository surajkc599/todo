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
import { ApiResponse, List, CreateListRequest } from '../types/index';
import * as listService from '../services/listService';

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
 *     summary: Get a list by ID with all items
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
 *         description: List retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/List'
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

    const list = await listService.getListById(id);

    if (!list) {
      return res.status(404).json({
        error: 'List not found',
      });
    }

    const response: ApiResponse<List> = {
      data: list,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
