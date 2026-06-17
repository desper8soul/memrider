/**
 * Resolves retrieval-eval.spec.json (seedKey + chunk indexes) to chunk IDs
 * and writes retrieval-eval.json for the eval runner.
 *
 * Run after seeding: pnpm --filter @memrider/api eval:sync-fixture
 */
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { loadEnv } from '@memrider/database';
import { PrismaModule, PrismaService } from '@memrider/database/lib';
import {
  AppLogger,
  createStandaloneAppLogger,
  LoggerModule,
} from '@memrider/shared/logging';
import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

loadEnv();

type RetrievalEvalSpecCase = {
  query: string;
  seedKey: string;
  expectedChunkIndexes: number[];
};

type RetrievalEvalFixture = { query: string; expectedChunkIds: string[] };

@Module({
  imports: [LoggerModule, PrismaModule],
})
class SyncFixtureCliModule {}

async function main() {
  const app = await NestFactory.createApplicationContext(SyncFixtureCliModule, {
    logger: false,
  });
  const logger = app.get(AppLogger);
  const prismaService = app.get(PrismaService);
  const prismaClient = prismaService.client;

  const fixturesDir = join(__dirname, 'fixtures');
  const spec: RetrievalEvalSpecCase[] = JSON.parse(
    readFileSync(join(fixturesDir, 'retrieval-eval.spec.json'), 'utf8'),
  );
  const fixture: RetrievalEvalFixture[] = [];

  for (const c of spec) {
    const entry = await prismaClient.journalEntry.findFirst({
      where: { content: { contains: `[memrider-seed:${c.seedKey}]` } },
    });
    if (!entry) {
      throw new Error(
        `Seeded entry not found for key "${c.seedKey}". Run: pnpm --filter @memrider/api eval:seed`,
      );
    }

    const chunks = await prismaClient.chunk.findMany({
      where: { entryId: entry.id },
      orderBy: { index: 'asc' },
    });

    const expectedChunkIds = c.expectedChunkIndexes
      .map((i) => chunks[i]?.id)
      .filter((id): id is string => Boolean(id));

    if (expectedChunkIds.length !== c.expectedChunkIndexes.length) {
      throw new Error(
        `Chunk index mismatch for "${c.seedKey}" (query: ${c.query}). ` +
          `Expected ${c.expectedChunkIndexes.length} chunk indexes, entry has ${chunks.length} chunks.`,
      );
    }

    fixture.push({ query: c.query, expectedChunkIds });
  }

  const outPath = join(fixturesDir, 'retrieval-eval.json');
  writeFileSync(outPath, `${JSON.stringify(fixture, null, 2)}\n`);
  logger.log(`Wrote ${fixture.length} cases to ${outPath}`, 'SyncFixtureCli');
  await app.close();
}

main().catch((err) => {
  const message = err instanceof Error ? err.stack ?? err.message : String(err);
  createStandaloneAppLogger().error(message, undefined, 'SyncFixtureCli');
  process.exit(1);
});
