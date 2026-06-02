import { Module } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';
import { RagService } from '../rag/rag.service';
import { RetrievalService } from '../retrieval/retrieval.service';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  controllers: [SearchController],
  providers: [
    SearchService,
    RagService,
    RetrievalService,
    LlmService,
  ],
})
export class SearchModule {}
