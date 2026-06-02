"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetrievalEvalDatasetSchema = exports.RetrievalEvalCaseSchema = exports.MemoryAnswerSchema = exports.SearchQuerySchema = exports.CreateEntrySchema = void 0;
const zod_1 = require("zod");
exports.CreateEntrySchema = zod_1.z.object({
    content: zod_1.z.string().min(1),
});
exports.SearchQuerySchema = zod_1.z.object({
    query: zod_1.z.string().min(1),
    topK: zod_1.z.number().int().min(1).max(20).optional(),
});
exports.MemoryAnswerSchema = zod_1.z.object({
    answer: zod_1.z.string(),
    supportingChunkIds: zod_1.z.array(zod_1.z.string()),
    confidence: zod_1.z.enum(['low', 'medium', 'high']),
});
exports.RetrievalEvalCaseSchema = zod_1.z.object({
    query: zod_1.z.string(),
    expectedChunkIds: zod_1.z.array(zod_1.z.string()),
});
exports.RetrievalEvalDatasetSchema = zod_1.z.array(exports.RetrievalEvalCaseSchema);
//# sourceMappingURL=schemas.js.map