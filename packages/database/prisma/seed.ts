/**
 * Seeds a sample Maldives journal entry for retrieval evaluation.
 * Run: pnpm --filter @memrider/database seed
 */
import { writeFileSync } from 'fs';
import { join } from 'path';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { pipeline } from '@xenova/transformers';
import { loadEnv } from '../src/load-env';
import { PrismaClient } from '../src/generated/prisma/client';

loadEnv();

const MODEL_ID = 'Xenova/all-MiniLM-L6-v2';

const MALDIVES_ENTRY = `Maldives trip — day 3

The water was impossibly clear. I felt calm for the first time in months, almost weightless watching the reef from the villa deck.

Evenings were quiet. I wrote that I did not want to leave yet, that my mind had finally slowed down.`;

function createPrisma() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not set');
  const pool = new pg.Pool({ connectionString });
  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

async function embed(text: string): Promise<string> {
  const extractor = await pipeline('feature-extraction', MODEL_ID, { quantized: true });
  const output = await extractor(text, { pooling: 'mean', normalize: true });
  const arr = Array.from(output.data as Float32Array);
  return `[${arr.join(',')}]`;
}

async function main() {
  const prisma = createPrisma();

  const existing = await prisma.journalEntry.findFirst({
    where: { content: { contains: 'Maldives' } },
  });
  if (existing) {
    console.log('Seed already present:', existing.id);
    await prisma.$disconnect();
    return;
  }

  const entry = await prisma.journalEntry.create({ data: { content: MALDIVES_ENTRY } });
  const paragraphs = MALDIVES_ENTRY.split(/\n\s*\n/).filter(Boolean);
  const chunkIds: string[] = [];

  for (let index = 0; index < paragraphs.length; index++) {
    const chunk = await prisma.chunk.create({
      data: { entryId: entry.id, content: paragraphs[index], index },
    });
    chunkIds.push(chunk.id);
    const literal = await embed(paragraphs[index]);
    await prisma.$executeRaw`
      UPDATE chunks SET embedding = ${literal}::vector WHERE id = ${chunk.id}
    `;
    console.log(`chunk ${chunk.id} (index ${index})`);
  }

  const evalFixture = [
    {
      query: 'How did I feel during the Maldives trip?',
      expectedChunkIds: chunkIds.filter((_, i) => i === 1),
    },
  ];
  const fixturePath = join(
    __dirname,
    '../../../apps/api/src/evaluation/fixtures/retrieval-eval.json',
  );
  writeFileSync(fixturePath, `${JSON.stringify(evalFixture, null, 2)}\n`);
  console.log('Updated retrieval-eval.json with chunk ids');
  console.log('Seeded entry:', entry.id);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
