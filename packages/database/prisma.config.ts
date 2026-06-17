import { loadEnv } from './src/load-env';
import { defineConfig, env } from 'prisma/config';

loadEnv();

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx ../../apps/api/src/evaluation/seed-eval-data.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
