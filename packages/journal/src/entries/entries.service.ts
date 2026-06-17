import { Injectable } from '@nestjs/common';
import { PrismaService } from '@memrider/database/lib';
import { ChunksService } from '../chunks/chunks.service';

@Injectable()
export class EntriesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly chunksService: ChunksService,
  ) {}

  async create(content: string) {
    const entry = await this.prismaService.client.journalEntry.create({
      data: { content },
    });
    const chunkIds = await this.chunksService.createForEntry(entry.id, content);
    return { entry, chunkIds };
  }

  async findAll() {
    return this.prismaService.client.journalEntry.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        chunks: { select: { id: true, index: true }, orderBy: { index: 'asc' } },
      },
    });
  }

  async findOne(id: string) {
    return this.prismaService.client.journalEntry.findUnique({
      where: { id },
      include: { chunks: { orderBy: { index: 'asc' } } },
    });
  }
}
