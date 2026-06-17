import type { AppLogger } from '@memrider/shared/logging';

export function createMockAppLogger(): AppLogger {
  return {
    log: () => undefined,
    warn: () => undefined,
    error: () => undefined,
  } as unknown as AppLogger;
}
