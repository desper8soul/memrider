import { Module } from "@nestjs/common";
import { LoggerModule } from '@memrider/shared/logging';
import { ChunkingService } from "./chunks/chunking.service";
import { ChunksService } from "./chunks/chunks.service";
import { PrismaModule } from "@memrider/database/lib";
import { EmbeddingsModule } from "./embeddings/embeddings.module";
import { EntriesService } from "./entries/entries.service";
import { EvaluationService } from "./evaluation/evaluation.service";
import { LlmService } from "./llm/llm.service";
import { PromptsModule } from "./prompts/prompts.module";
import { RagService } from "./rag/rag.service";
import { RetrievalService } from "./retrieval/retrieval.service";
import { SearchService } from "./search/search.service";
import { UsersService } from "./users/users.service";

@Module({
  imports: [
    LoggerModule,
    PrismaModule,
    EmbeddingsModule,
    PromptsModule,
  ],
  providers: [
    ChunkingService,
    ChunksService,
    EntriesService,
    LlmService,
    RetrievalService,
    RagService,
    SearchService,
    EvaluationService,
    UsersService,
  ],
  exports: [
    ChunkingService,
    ChunksService,
    EntriesService,
    LlmService,
    RetrievalService,
    RagService,
    SearchService,
    EvaluationService,
    UsersService,
  ],
})
export class JournalModule {}
