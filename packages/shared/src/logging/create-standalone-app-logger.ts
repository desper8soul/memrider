import { AppLogger } from './app-logger.service';

/**
 * Logging for scripts that run outside Nest DI (e.g. Prisma seed).
 * In Nest apps, import LoggerModule and inject AppLogger instead.
 */
export function createStandaloneAppLogger(): AppLogger {
  return new AppLogger();
}
