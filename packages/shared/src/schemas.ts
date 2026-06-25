import { z } from 'zod';

// --- requests ---

export const CreateEntrySchema = z.object({
  content: z.string().min(1),
});

export const SearchQuerySchema = z.object({
  query: z.string().min(1),
  topK: z.number().int().min(1).max(20).optional(),
});

// --- domain ---

export const ConfidenceSchema = z.enum(['low', 'medium', 'high']);

export const MemoryAnswerSchema = z.object({
  answer: z.string(),
  supportingChunkIds: z.array(z.string()),
  confidence: ConfidenceSchema,
});

export const RetrievedChunkSchema = z.object({
  id: z.string(),
  entryId: z.string(),
  content: z.string(),
  similarity: z.number(),
  createdAt: z.coerce.date(),
});

export const SearchResponseMetaSchema = z.object({
  latencyMs: z.number(),
  retrievedChunkIds: z.array(z.string()),
  promptName: z.string(),
  promptVersion: z.string(),
});

export const SearchResponseSchema = z.object({
  answer: z.string(),
  supportingChunkIds: z.array(z.string()),
  confidence: ConfidenceSchema,
  retrieved: z.array(RetrievedChunkSchema),
  meta: SearchResponseMetaSchema,
});

export const CreateEntryResponseSchema = z.object({
  id: z.string(),
  content: z.string(),
  createdAt: z.coerce.date(),
  chunkIds: z.array(z.string()),
});

export const JournalEntryListItemSchema = z.object({
  id: z.string(),
  content: z.string(),
  createdAt: z.coerce.date(),
  chunkCount: z.number().int().nonnegative(),
});

export const ChunkSummarySchema = z.object({
  id: z.string(),
  index: z.number().int(),
});

export const ChunkDetailSchema = z.object({
  id: z.string(),
  entryId: z.string(),
  content: z.string(),
  index: z.number().int(),
});

export const JournalEntryDetailSchema = z.object({
  id: z.string(),
  content: z.string(),
  createdAt: z.coerce.date(),
  chunks: z.array(ChunkDetailSchema),
});

export const AuthUserSchema = z.object({
  id: z.string(),
  email: z.string().nullable(),
});

export const SyncProfileSchema = z.object({
  idToken: z.string().min(1),
});

// --- eval ---

export const RetrievalEvalCaseSchema = z.object({
  query: z.string(),
  expectedChunkIds: z.array(z.string()),
});

export const RetrievalEvalDatasetSchema = z.array(RetrievalEvalCaseSchema);

// --- inferred types ---

export type CreateEntryInput = z.infer<typeof CreateEntrySchema>;
export type SearchQueryInput = z.infer<typeof SearchQuerySchema>;
export type MemoryAnswer = z.infer<typeof MemoryAnswerSchema>;
export type RetrievedChunk = z.infer<typeof RetrievedChunkSchema>;
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
export type CreateEntryResponse = z.infer<typeof CreateEntryResponseSchema>;
export type JournalEntryListItem = z.infer<typeof JournalEntryListItemSchema>;
export type JournalEntryDetail = z.infer<typeof JournalEntryDetailSchema>;
export type AuthUser = z.infer<typeof AuthUserSchema>;
export type SyncProfileInput = z.infer<typeof SyncProfileSchema>;
export type RetrievalEvalCase = z.infer<typeof RetrievalEvalCaseSchema>;
