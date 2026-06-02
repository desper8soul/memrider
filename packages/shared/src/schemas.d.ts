import { z } from 'zod';
export declare const CreateEntrySchema: z.ZodObject<{
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    content: string;
}, {
    content: string;
}>;
export declare const SearchQuerySchema: z.ZodObject<{
    query: z.ZodString;
    topK: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    query: string;
    topK?: number | undefined;
}, {
    query: string;
    topK?: number | undefined;
}>;
export declare const MemoryAnswerSchema: z.ZodObject<{
    answer: z.ZodString;
    supportingChunkIds: z.ZodArray<z.ZodString, "many">;
    confidence: z.ZodEnum<["low", "medium", "high"]>;
}, "strip", z.ZodTypeAny, {
    answer: string;
    supportingChunkIds: string[];
    confidence: "low" | "medium" | "high";
}, {
    answer: string;
    supportingChunkIds: string[];
    confidence: "low" | "medium" | "high";
}>;
export type MemoryAnswer = z.infer<typeof MemoryAnswerSchema>;
export declare const RetrievalEvalCaseSchema: z.ZodObject<{
    query: z.ZodString;
    expectedChunkIds: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    query: string;
    expectedChunkIds: string[];
}, {
    query: string;
    expectedChunkIds: string[];
}>;
export declare const RetrievalEvalDatasetSchema: z.ZodArray<z.ZodObject<{
    query: z.ZodString;
    expectedChunkIds: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    query: string;
    expectedChunkIds: string[];
}, {
    query: string;
    expectedChunkIds: string[];
}>, "many">;
export type RetrievalEvalCase = z.infer<typeof RetrievalEvalCaseSchema>;
