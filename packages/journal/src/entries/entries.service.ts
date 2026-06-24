import { Injectable } from '@nestjs/common';
import { PrismaService } from '@memrider/database/lib';
import { ChunksService } from '../chunks/chunks.service';

@Injectable()
export class EntriesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly chunksService: ChunksService,
  ) {}

  async create(userId: string, content: string) {
    const entry = await this.prismaService.client.journalEntry.create({
      data: { userId, content },
    });
    const chunkIds = await this.chunksService.createForEntry(entry.id, content);
    return { entry, chunkIds };
  }

  async findAll(userId: string) {
    return this.prismaService.client.journalEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        chunks: { select: { id: true, index: true }, orderBy: { index: 'asc' } },
      },
    });
  }

  async findOne(userId: string, id: string) {
    return this.prismaService.client.journalEntry.findFirst({
      where: { id, userId },
      include: { chunks: { orderBy: { index: 'asc' } } },
    });
  }
}
