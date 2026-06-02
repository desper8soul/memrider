import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ChunksService } from '../chunks/chunks.service';

@Injectable()
export class EntriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chunks: ChunksService,
  ) {}

  async create(content: string) {
    const entry = await this.prisma.client.journalEntry.create({
      data: { content },
    });
    const chunkIds = await this.chunks.createForEntry(entry.id, content);
    return { entry, chunkIds };
  }

  async findAll() {
    return this.prisma.client.journalEntry.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        chunks: { select: { id: true, index: true }, orderBy: { index: 'asc' } },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.client.journalEntry.findUnique({
      where: { id },
      include: { chunks: { orderBy: { index: 'asc' } } },
    });
  }
}
