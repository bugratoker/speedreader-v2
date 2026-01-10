/**
 * Prisma Configuration File
 * Required for Prisma 7+ - Database configuration for CLI operations
 * See: https://pris.ly/d/config-datasource
 */

import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
    // The main entry for your schema
    schema: 'src/prisma/schema.prisma',

    // The database URL
    datasource: {
        // Type Safe env() helper from prisma/config
        url: env('DATABASE_URL'),
    },
});
