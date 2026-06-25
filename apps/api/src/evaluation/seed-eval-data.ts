/**
 * Seeds eval journal entries via the same chunk + embed path as POST /entries.
 * Run: pnpm --filter @memrider/api eval:seed
 */
import { loadEnv } from "@memrider/database";
import { PrismaModule, PrismaService } from "@memrider/database/lib";
import {
  ChunksService,
  EntriesService,
  EVAL_SEED_USER_ID,
  JournalModule,
} from "@memrider/journal";
import { AppConfigModule } from "@memrider/shared/config";
import {
  AppLogger,
  createStandaloneAppLogger,
  LoggerModule,
} from "@memrider/shared/logging";
import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import {
  EVAL_SEED_ENTRIES,
  seedMarker,
  type EvalSeedEntry,
} from "./eval-seed-data";

loadEnv();

@Module({
  imports: [AppConfigModule, LoggerModule, JournalModule, PrismaModule],
})
class SeedEvalCliModule {}

async function ensureEvalSeedEntry(
  entry: EvalSeedEntry,
  userId: string,
  entriesService: EntriesService,
  chunksService: ChunksService,
  prismaService: PrismaService,
): Promise<string> {
  const prisma = prismaService.client;
  const existing = await prisma.journalEntry.findFirst({
    where: {
      userId,
      content: { contains: seedMarker(entry.key) },
    },
  });

  if (!existing) {
    const { entry: created } = await entriesService.create(userId, entry.content);
    return created.id;
  }

  if (existing.content === entry.content) {
    return existing.id;
  }

  await prisma.chunk.deleteMany({ where: { entryId: existing.id } });
  await prisma.journalEntry.update({
    where: { id: existing.id },
    data: { content: entry.content },
  });

  await chunksService.createForEntry(existing.id, entry.content);

  return existing.id;
}

async function main() {
  const app = await NestFactory.createApplicationContext(SeedEvalCliModule, {
    logger: false,
  });

  const logger = app.get(AppLogger);
  const entriesService = app.get(EntriesService);
  const chunksService = app.get(ChunksService);
  const prismaService = app.get(PrismaService);

  for (const entry of EVAL_SEED_ENTRIES) {
    const entryId = await ensureEvalSeedEntry(
      entry,
      EVAL_SEED_USER_ID,
      entriesService,
      chunksService,
      prismaService,
    );
    logger.log(`Seeded eval entry: ${entry.key} ${entryId}`, "EvalSeed");
  }

  await app.close();
}

main().catch((err) => {
  const message =
    err instanceof Error ? (err.stack ?? err.message) : String(err);
  createStandaloneAppLogger().error(message, undefined, "EvalSeed");
  process.exit(1);
});
