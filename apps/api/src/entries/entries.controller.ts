import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  CreateEntryResponseSchema,
  CreateEntrySchema,
  JournalEntryDetailSchema,
  JournalEntryListItemSchema,
  type CreateEntryInput,
} from '@memrider/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { EntriesService } from '@memrider/journal';

@Controller('entries')
export class EntriesController {
  constructor(private readonly entriesService: EntriesService) {}

  @Post()
  async create(@Body(new ZodValidationPipe(CreateEntrySchema)) body: CreateEntryInput) {
    const { entry, chunkIds } = await this.entriesService.create(body.content);
    return CreateEntryResponseSchema.parse({
      id: entry.id,
      content: entry.content,
      createdAt: entry.createdAt,
      chunkIds,
    });
  }

  @Get()
  async list() {
    const entries = await this.entriesService.findAll();
    return entries.map((e) =>
      JournalEntryListItemSchema.parse({
        id: e.id,
        content: e.content,
        createdAt: e.createdAt,
        chunkCount: e.chunks.length,
      }),
    );
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const entry = await this.entriesService.findOne(id);
    return entry ? JournalEntryDetailSchema.parse(entry) : null;
  }
}
