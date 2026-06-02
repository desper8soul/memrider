import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateEntryDto } from './dto/create-entry.dto';
import { EntriesService } from './entries.service';

@Controller('entries')
export class EntriesController {
  constructor(private readonly entries: EntriesService) {}

  @Post()
  async create(@Body() dto: CreateEntryDto) {
    const { entry, chunkIds } = await this.entries.create(dto.content);
    return {
      id: entry.id,
      content: entry.content,
      createdAt: entry.createdAt,
      chunkIds,
    };
  }

  @Get()
  async list() {
    const entries = await this.entries.findAll();
    return entries.map((e: { id: string; content: string; createdAt: Date; chunks: unknown[] }) => ({
      id: e.id,
      content: e.content,
      createdAt: e.createdAt,
      chunkCount: e.chunks.length,
    }));
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.entries.findOne(id);
  }
}
