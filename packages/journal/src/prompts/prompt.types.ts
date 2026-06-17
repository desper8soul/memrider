import { z } from 'zod';

export const PromptVersionManifestSchema = z.object({
  description: z.string(),
  system: z.string(),
  user: z.string(),
});

export const PromptManifestSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  defaultVersion: z.string(),
  versions: z.record(z.string(), PromptVersionManifestSchema),
});

export type PromptManifest = z.infer<typeof PromptManifestSchema>;
export type PromptVersionManifest = z.infer<typeof PromptVersionManifestSchema>;

export interface RenderedPrompt {
  name: string;
  version: string;
  description: string;
  system: string;
  user: string;
}

export interface PromptRenderInput {
  query: string;
  memories: string;
}
