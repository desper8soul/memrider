import { Module } from "@nestjs/common";
import { AppConfigModule } from '@memrider/shared/config';
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

@Module({
  imports: [
    LoggerModule,
    AppConfigModule,
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
  ],
})
export class JournalModule {}
