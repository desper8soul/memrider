import { config } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';

let loaded = false;

/** Load monorepo root `.env` (idempotent). Safe to call before Prisma client creation. */
export function loadEnv(): void {
  if (loaded) return;

  const candidates = [
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), '../../.env'),
    resolve(__dirname, '../../../.env'),
    resolve(__dirname, '../../.env'),
    resolve(__dirname, '../.env'),
  ];

  for (const path of candidates) {
    if (existsSync(path)) {
      config({ path });
    }
  }

  loaded = true;
}
