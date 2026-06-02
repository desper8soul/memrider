import { Module } from '@nestjs/common';
import { ChunkingService } from '../chunks/chunking.service';
import { ChunksService } from '../chunks/chunks.service';
import { EntriesController } from './entries.controller';
import { EntriesService } from './entries.service';

@Module({
  controllers: [EntriesController],
  providers: [EntriesService, ChunksService, ChunkingService],
  exports: [EntriesService, ChunksService],
})
export class EntriesModule {}
