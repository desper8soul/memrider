import { z } from 'zod';

export const CreateEntrySchema = z.object({
  content: z.string().min(1),
});

export const SearchQuerySchema = z.object({
  query: z.string().min(1),
  topK: z.number().int().min(1).max(20).optional(),
});

export const MemoryAnswerSchema = z.object({
  answer: z.string(),
  supportingChunkIds: z.array(z.string()),
  confidence: z.enum(['low', 'medium', 'high']),
});

export type MemoryAnswer = z.infer<typeof MemoryAnswerSchema>;

export const RetrievalEvalCaseSchema = z.object({
  query: z.string(),
  expectedChunkIds: z.array(z.string()),
});

export const RetrievalEvalDatasetSchema = z.array(RetrievalEvalCaseSchema);

export type RetrievalEvalCase = z.infer<typeof RetrievalEvalCaseSchema>;
