/**
 * Prisma Database Client
 * Singleton instance for database operations
 * Updated for Prisma 7 with PostgreSQL driver adapter
 */

import { PrismaClient } from '../prisma/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Create the PostgreSQL adapter
const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL || 'postgresql://speedreader:speedreader_secret@localhost:5432/speedreader'
});

// Prevent multiple instances during hot reload in development
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

export default prisma;
