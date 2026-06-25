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
import { CurrentUser, type AuthenticatedUser } from '@memrider/auth';

@Controller('entries')
export class EntriesController {
  constructor(private readonly entriesService: EntriesService) {}

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(CreateEntrySchema)) body: CreateEntryInput,
  ) {
    const { entry, chunkIds } = await this.entriesService.create(user.id, body.content);
    return CreateEntryResponseSchema.parse({
      id: entry.id,
      content: entry.content,
      createdAt: entry.createdAt,
      chunkIds,
    });
  }

  @Get()
  async list(@CurrentUser() user: AuthenticatedUser) {
    const entries = await this.entriesService.findAll(user.id);
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
  async get(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const entry = await this.entriesService.findOne(user.id, id);
    return entry ? JournalEntryDetailSchema.parse(entry) : null;
  }
}
