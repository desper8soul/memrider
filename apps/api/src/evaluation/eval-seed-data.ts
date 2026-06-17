/**
 * Journal entries for retrieval eval. Each content line includes a stable
 * `[memrider-seed:<key>]` marker used by eval:sync-fixture to resolve chunk IDs.
 */
export type EvalSeedEntry = {
  key: string;
  content: string;
};

const CONFERENCE_PAD =
  " I kept the conference badge in my wallet as a reminder to finish the eval harness.";

function padParagraph(text: string, minChars: number): string {
  let result = text.trim();

  while (result.length < minChars) {
    result += CONFERENCE_PAD;
  }

  return result;
}

const CONFERENCE_RETRO_WEEK_CONTENT = [
  padParagraph(
    `[memrider-seed:conference-retro-week] Conference week — travel and opening day. Travel in was a mess: flight delayed three hours, hotel after midnight, note to book earlier next time. The keynote pushed eval harnesses as part of the product, not a side repo, and I left with three questions for our team about how we ship regression tests with every prompt change. I walked the expo hall but kept coming back to the idea that retrieval quality is the real product surface, not the chat wrapper.`,
    1250,
  ),
  padParagraph(
    `Midweek workshops on retrieval metrics clicked for me on Wednesday. Hit rate alone hides almost-right failures when the right memory is ranked fourth; I should track MRR or nDCG when we have ranked lists instead of treating top-one as the only signal. One speaker walked through a failure mode where the model cites a plausible chunk that never surfaced in retrieval, which made our hallucination guard feel necessary rather than decorative.`,
    1250,
  ),
  padParagraph(
    `Thursday dinner with the Postgres folks was useful. They nudged me to tune pgvector HNSW per dataset size before the next migration instead of copying default build parameters from a blog post. We talked about recall versus build time when the table is still under ten thousand rows and whether IVFFlat is even worth considering at our scale.`,
    1250,
  ),
  padParagraph(
    `Friday demo day went fine until Q&A surfaced that we have no story for memory deletion; action item is a one-pager on retention and export before we call the product trustworthy. A partner asked about multi-tenant isolation and I had no crisp answer beyond separate databases per user for V1. Sunday I tried inbox zero, failed, and at least filed everything into Memrider with the seed markers intact for eval sync.`,
    1250,
  ),
].join("\n\n");

export const EVAL_SEED_ENTRIES: EvalSeedEntry[] = [
  {
    key: "quick-gym",
    content: `[memrider-seed:quick-gym] Gym — 100kg squat. Did 3x5 at 100kg. Felt heavy but clean, and I was happy to leave it there without chasing a sixth rep.`,
  },
  {
    key: "parking-ticket",
    content: `[memrider-seed:parking-ticket] Parking ticket on Oak St. Appeal deadline is March 12; reference number PK-88421. I need to upload the photos this weekend.`,
  },
  {
    key: "maldives-day3",
    content: `[memrider-seed:maldives-day3] Maldives, day three. The water was impossibly clear and I felt calm for the first time in months, almost weightless watching the reef from the villa deck. Evenings were quiet. I wrote that I did not want to leave yet, that my mind had finally slowed down.`,
  },
  {
    key: "doctor-visit-iron",
    content: `[memrider-seed:doctor-visit-iron] Saw Dr. Patel about fatigue. Ferritin is low; she wants iron bisglycinate in the morning with vitamin C and no coffee for an hour after. For sleep she suggested magnesium glycinate in the evening and a colder bedroom.`,
  },
  {
    key: "project-memrider-v1-notes",
    content: `[memrider-seed:project-memrider-v1-notes] Memrider V1 notes. I want retrieval to stay deterministic and local, with a cloud LLM only for synthesis after chunks are retrieved. I am explicitly not building agents, multi-step workflows, or a memory graph — it has to stay simple enough to evaluate.`,
  },
  {
    key: "conference-retro-week",
    content: CONFERENCE_RETRO_WEEK_CONTENT,
  },
  {
    key: "apartment-move-log",
    content: `[memrider-seed:apartment-move-log] Moving apartments this spring. In March I started decluttering and sold the couch on Marketplace with pickup on the fourteenth. Two weeks later I booked BlueLine for April third at nine and paid the deposit; I still have to reserve the elevator with the building office. The long packing day at the end of March was mostly kitchen boxes and the IKEA bed, where one bolt stripped until I dug out the extractor from the toolbox, plus an embarrassing purge of expired spices. On move day the crew arrived early, almost everything fit, and the desk only made it in when Sam in 402 (+1-555-0142) let us take it up via the balcony; power was out until four so I worked from the café on the corner and saved the Wi‑Fi password from the receipt. That night we slept on the mattress on the floor with Thai takeaway. By April tenth the internet worked, the bank and insurer had the new address, and one box labeled office — cables was still missing.`,
  },
  {
    key: "cedar-ridge-hike-june-15",
    content: `[memrider-seed:cedar-ridge-hike-june-15] Saturday, June 15, solo on Cedar Ridge. I left early with coffee and the rain shell I always forget, the road empty and cool, a podcast about retrieval evals somehow clearer with mountains ahead. The trailhead lot was half full; I signed the register and climbed through mud that gave way to drier switchbacks under thicker trees. Above the fog I ate on a flat rock, watched three hawks, and caught my head drafting plans for the rest of the month — I made myself sit ten minutes with no lists and that was the best part. Coming down I slipped on a wet root, caught a pine, and babied a sore right ankle that never swelled; I reached the car before the thunder built. Home was shower, leftover pasta, the watch syncing while I stretched — fourteen point two miles and about thirty-four hundred feet, my biggest day this year. I iced the ankle, skipped the laptop, and went to bed tired in the way that feels earned.`,
  },
];

export function seedMarker(key: string): string {
  return `[memrider-seed:${key}]`;
}
