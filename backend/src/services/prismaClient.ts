/**
 * Prisma Client Singleton
 * Provides a single instance of the Prisma client for database operations
 * Prevents multiple client instances and connection exhaustion
 */

import { PrismaClient } from '@prisma/client';

// Global type declaration to avoid multiple client instantiation
declare global {
  var prisma: PrismaClient | undefined;
}

/**
 * Instantiate Prisma Client
 * Uses a global instance in development to avoid connection exhaustion
 * In production, a single instance is created for the lifetime of the app
 */
export const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;
