import { join } from 'path';

/** `packages/journal/prompt-registry` when running from compiled `dist/`. */
export function getDefaultPromptsDir(): string {
  return join(__dirname, '..', 'prompt-registry');
}
