/**
 * Strixhaven Drafter — Booster Engine
 *
 * Pure functional core: all randomness is explicit, the only side-effect
 * is the single Prisma transaction inside `generateFullKit`.
 *
 * Play Booster anatomy (14 cards):
 *   Slot 1   — SOA card, weighted rarity (U 67% / R 26% / M 7%)
 *   Slot 2   — SOS foil (any rarity, uniform) [Seeded: replaced by college foil Rare/Mythic]
 *   Slot 3   — SOS Land (20% chance foil)
 *   Slots 4… — N SOS Rare/Mythic (N from rollRareSlotCount)
 *   Next 3   — SOS Uncommons (non-land)
 *   Rest     — SOS Commons (non-land) until 14 total
 */

import type { Card, College } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// ─── Probability constants ──────────────────────────────────────────────────────

/**
 * Rarity distribution of the guaranteed SOA slot (Mystical Archive).
 * Must sum to 1.0.
 */
export const SOA_RARITY_ODDS = {
  UNCOMMON: 0.67,
  RARE: 0.26,
  MYTHIC: 0.07,
} as const satisfies Record<string, number>;

/** Probability that a rare slot is upgraded to Mythic (mirrors real MTG). */
export const MYTHIC_UPGRADE_RATE = 0.125; // 1/8

/**
 * Probability the Land slot is foil.
 */
export const LAND_FOIL_RATE = 0.2;

/** MTG color identities per Strixhaven college. */
export const COLLEGE_COLORS = {
  LOREHOLD: ["R", "W"],
  PRISMARI: ["U", "R"],
  QUANDRIX: ["G", "U"],
  SILVERQUILL: ["W", "B"],
  WITHERBLOOM: ["B", "G"],
} as const satisfies Record<College, string[]>;

// ─── Play Booster slot layout ───────────────────────────────────────────────────

/** Cards per booster (Play and Seeded). */
export const BOOSTER_SIZE = 14;

/** Fixed non-rare, non-commons/uncommons slots per booster. */
const FIXED_SLOTS = 3; // SOA + Foil SOS + Land
/** Always-present uncommon count per booster. */
const UNCOMMON_SLOTS = 3;

// ─── Grid layout constants ──────────────────────────────────────────────────────

export const CARD_W = 130;
export const CARD_H = 182;
const COL_GAP = 20;
const ROW_GAP = 12;
const ORIGIN_X = 24;
const ORIGIN_Y = 24;
const COL_STRIDE = CARD_W + COL_GAP;

/** X position of the standalone promo card (column 7 equivalent). */
const PROMO_OFFSET_X = ORIGIN_X + 6 * COL_STRIDE + 40;
const PROMO_OFFSET_Y = ORIGIN_Y;

// ─── Internal types ─────────────────────────────────────────────────────────────

/** One card as it will be written to PlacedCard. */
type DraftCard = {
  readonly cardId: string;
  readonly isFoil: boolean;
};

type BoosterPack = {
  readonly cards: readonly DraftCard[];
};

type PlacedCardInput = DraftCard & {
  readonly posX: number;
  readonly posY: number;
  readonly zIndex: number;
};

// ─── Pure RNG helpers ────────────────────────────────────────────────────────────

/**
 * Single-roll weighted bucket selector.
 * The last bucket absorbs any floating-point remainder.
 */
function weightedIndex(weights: readonly number[]): number {
  let r = Math.random();
  for (let i = 0; i < weights.length - 1; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

/**
 * How many Rare/Mythic slots appear in this booster.
 *
 * | Count | Probability |
 * |-------|-------------|
 * |   1   |     60%     |
 * |   2   |     33%     |
 * |   3   |      6%     |
 * |   4   |    0.5%     |
 * |   5   |    0.5%     |
 */
export function rollRareSlotCount(): 1 | 2 | 3 | 4 | 5 {
  return (weightedIndex([0.6, 0.33, 0.06, 0.005, 0.005]) + 1) as
    | 1
    | 2
    | 3
    | 4
    | 5;
}

/**
 * Samples `n` distinct items from `pool` (Fisher-Yates partial shuffle).
 * Falls back to sampling with replacement when `pool.length < n`.
 */
function sampleN<T>(pool: readonly T[], n: number): T[] {
  if (pool.length === 0) return [];
  const bag = [...pool];
  const result: T[] = [];
  const distinct = Math.min(n, bag.length);

  for (let i = 0; i < distinct; i++) {
    const idx = Math.floor(Math.random() * (bag.length - i));
    result.push(bag[idx]);
    bag[idx] = bag[bag.length - i - 1]; // swap-remove
  }
  while (result.length < n) {
    result.push(pool[Math.floor(Math.random() * pool.length)]);
  }
  return result;
}

/** Picks one card, applying the mythic upgrade rate. */
function rollRareMythic(
  rares: readonly Card[],
  mythics: readonly Card[],
): Card {
  const useMythic = mythics.length > 0 && Math.random() < MYTHIC_UPGRADE_RATE;
  const pool = useMythic ? mythics : rares.length > 0 ? rares : mythics;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ─── Pool helpers ────────────────────────────────────────────────────────────────

function parseColors(raw: unknown): string[] {
  // 1. Se já for um array (como vem do Json do Prisma)
  if (Array.isArray(raw)) {
    return raw.map((s) => String(s).trim()).filter(Boolean);
  }

  // 2. Se for uma string separada por vírgula
  if (typeof raw === "string") {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  // 3. Se for null, undefined ou objeto inválido
  return [];
}

function isLand(card: Card): boolean {
  return card.typeLine.split(/\s+/).includes("Land");
}

function matchesCollege(card: Card, colors: readonly string[]): boolean {
  const cc = parseColors(card.colors);
  return cc.length === 0 || cc.some((c) => (colors as string[]).includes(c));
}

// ─── Slot builders ───────────────────────────────────────────────────────────────

/**
 * Slot 1 — SOA (Mystical Archive) card with weighted rarity.
 * Rarity distribution: Uncommon 67% / Rare 26% / Mythic 7%.
 */
function drawSoaSlot(allCards: readonly Card[]): DraftCard {
  const soa = allCards.filter((c) => c.set === "SOA");

  const soaUncommons = soa.filter((c) => c.rarity === "UNCOMMON");
  const soaRares = soa.filter((c) => c.rarity === "RARE");
  const soaMythics = soa.filter((c) => c.rarity === "MYTHIC");

  const pools = [soaUncommons, soaRares, soaMythics];
  const rarityIdx = weightedIndex([
    SOA_RARITY_ODDS.UNCOMMON,
    SOA_RARITY_ODDS.RARE,
    SOA_RARITY_ODDS.MYTHIC,
  ]);

  // Walk back to a non-empty pool if the chosen rarity bucket is empty
  let pool = pools[rarityIdx];
  if (pool.length === 0) pool = soa;
  if (pool.length === 0) return { cardId: "", isFoil: false }; // no SOA cards seeded yet

  const card = pool[Math.floor(Math.random() * pool.length)];
  return { cardId: card.id, isFoil: false };
}

/**
 * Slot 2 (Play Booster) — one foil SOS card of any rarity.
 */
function drawFoilSosSlot(allCards: readonly Card[]): DraftCard {
  const sos = allCards.filter((c) => c.set === "SOS");
  if (sos.length === 0) return { cardId: "", isFoil: true };
  const card = sos[Math.floor(Math.random() * sos.length)];
  return { cardId: card.id, isFoil: true };
}

/**
 * Slot 2 (Seeded Booster) — one guaranteed Foil Rare/Mythic from college pool.
 */
function drawCollegeFoilRareSlot(
  allCards: readonly Card[],
  colors: readonly string[],
): DraftCard {
  const pool = allCards.filter(
    (c) => c.set === "SOS" && matchesCollege(c, colors),
  );
  const rares = pool.filter((c) => c.rarity === "RARE");
  const mythics = pool.filter((c) => c.rarity === "MYTHIC");

  if (rares.length === 0 && mythics.length === 0) {
    // Fallback: any SOS rare/mythic
    const fallback = allCards.filter(
      (c) => c.set === "SOS" && (c.rarity === "RARE" || c.rarity === "MYTHIC"),
    );
    if (fallback.length === 0) return { cardId: "", isFoil: true };
    const card = fallback[Math.floor(Math.random() * fallback.length)];
    return { cardId: card.id, isFoil: true };
  }

  return { cardId: rollRareMythic(rares, mythics).id, isFoil: true };
}

/**
 * Slot 3 — one SOS Land (with optional college filter). 20% chance of foil.
 */
function drawLandSlot(
  allCards: readonly Card[],
  colors?: readonly string[],
): DraftCard {
  let lands = allCards.filter((c) => c.set === "SOS" && isLand(c));
  if (colors) {
    const collegeLands = lands.filter((c) => matchesCollege(c, colors));
    if (collegeLands.length > 0) lands = collegeLands;
  }
  if (lands.length === 0) return { cardId: "", isFoil: false };

  const card = lands[Math.floor(Math.random() * lands.length)];
  const isFoil = Math.random() < LAND_FOIL_RATE;
  return { cardId: card.id, isFoil };
}

// ─── Booster assembly ─────────────────────────────────────────────────────────────

/**
 * Fills the remaining slots of a booster after fixed + rare slots.
 *
 * @param nonLandSos  Pre-filtered pool (SOS, non-land, college-filtered if seeded)
 * @param rareCount   How many rare slots were already consumed
 * @returns `[uncommons, commons]` arrays sized for the remaining budget
 */
function fillCommonUncommonSlots(
  nonLandSos: readonly Card[],
  rareCount: number,
): { uncommons: DraftCard[]; commons: DraftCard[] } {
  const budget = BOOSTER_SIZE - FIXED_SLOTS - rareCount - UNCOMMON_SLOTS;
  const commonCount = Math.max(0, budget);

  const uncommonPool = nonLandSos.filter((c) => c.rarity === "UNCOMMON");
  const commonPool = nonLandSos.filter((c) => c.rarity === "COMMON");

  const uncommons = sampleN(uncommonPool, UNCOMMON_SLOTS).map((c) => ({
    cardId: c.id,
    isFoil: false,
  }));
  const commons = sampleN(commonPool, commonCount).map((c) => ({
    cardId: c.id,
    isFoil: false,
  }));

  return { uncommons, commons };
}

/**
 * Opens one standard Play Booster.
 *
 * Slot order written to the array (affects grid row order):
 *   SOA | Foil SOS | Land | Rares (×N) | Uncommons (×3) | Commons (×(8-N))
 */
function openPlayBooster(allCards: readonly Card[]): BoosterPack {
  const cards: DraftCard[] = [];

  // Slot 1 — SOA
  cards.push(drawSoaSlot(allCards));

  // Slot 2 — foil SOS
  cards.push(drawFoilSosSlot(allCards));

  // Slot 3 — land
  cards.push(drawLandSlot(allCards));

  // Rare/Mythic slots
  const rareCount = rollRareSlotCount();
  const sos = allCards.filter((c) => c.set === "SOS");
  const rares = sos.filter((c) => c.rarity === "RARE");
  const mythics = sos.filter((c) => c.rarity === "MYTHIC");

  for (let i = 0; i < rareCount; i++) {
    cards.push({ cardId: rollRareMythic(rares, mythics).id, isFoil: false });
  }

  // Uncommons + commons (non-land SOS to avoid double-land)
  const nonLandSos = sos.filter((c) => !isLand(c));
  const { uncommons, commons } = fillCommonUncommonSlots(nonLandSos, rareCount);
  cards.push(...uncommons, ...commons);

  return { cards };
}

/**
 * Opens the college-specific Seeded Booster (14 cards, college-filtered).
 *
 * Differences vs Play Booster:
 * - Slot 2 becomes a guaranteed Foil Rare/Mythic from the college color pool
 * - All SOS slots (land, rares, uncommons, commons) are filtered by college colors
 * - SOA slot (Slot 1) remains unfiltered — Archive cards are set-agnostic
 */
function openSeededBooster(
  allCards: readonly Card[],
  college: College,
): BoosterPack {
  const colors = COLLEGE_COLORS[college];
  const cards: DraftCard[] = [];

  // Slot 1 — SOA (global pool, not college-filtered)
  cards.push(drawSoaSlot(allCards));

  // Slot 2 — guaranteed college foil Rare/Mythic (replaces generic foil SOS)
  cards.push(drawCollegeFoilRareSlot(allCards, colors));

  // Slot 3 — college-appropriate land (prefers matching colors)
  cards.push(drawLandSlot(allCards, colors));

  // Rare/Mythic slots (college-filtered)
  const rareCount = rollRareSlotCount();
  const sosPool = allCards.filter(
    (c) => c.set === "SOS" && matchesCollege(c, colors),
  );
  const rares = sosPool.filter((c) => c.rarity === "RARE");
  const mythics = sosPool.filter((c) => c.rarity === "MYTHIC");

  for (let i = 0; i < rareCount; i++) {
    cards.push({ cardId: rollRareMythic(rares, mythics).id, isFoil: false });
  }

  // Uncommons + commons (college-filtered, non-land)
  const nonLandPool = sosPool.filter((c) => !isLand(c));
  const { uncommons, commons } = fillCommonUncommonSlots(
    nonLandPool,
    rareCount,
  );
  cards.push(...uncommons, ...commons);

  return { cards };
}

// ─── Promo card ───────────────────────────────────────────────────────────────────

/**
 * Draws one random Rare or Mythic from SOS as the prerelease promo card.
 * The promo is always foil.
 */
export function generatePromoCard(allCards: readonly Card[]): DraftCard {
  const pool = allCards.filter(
    (c) => c.set === "SOS" && (c.rarity === "RARE" || c.rarity === "MYTHIC"),
  );
  if (pool.length === 0)
    throw new Error("No SOS Rare/Mythic cards in pool for promo.");
  const card = pool[Math.floor(Math.random() * pool.length)];
  return { cardId: card.id, isFoil: true };
}

// ─── Layout ───────────────────────────────────────────────────────────────────────

/**
 * Resolves canvas coordinates for a card given its pack column and row.
 */
function toGridPos(
  packIndex: number,
  slotIndex: number,
): { posX: number; posY: number } {
  return {
    posX: ORIGIN_X + packIndex * COL_STRIDE,
    posY: ORIGIN_Y + slotIndex * (CARD_H + ROW_GAP),
  };
}

/**
 * Converts an ordered list of packs + optional promo into insertion-ready records.
 * Each pack occupies its own canvas column (packs 0-4 = Play, pack 5 = Seeded).
 * The promo card sits to the right of all packs (column 6 + offset).
 */
function layoutAll(
  packs: readonly BoosterPack[],
  promo: DraftCard,
): PlacedCardInput[] {
  const placed: PlacedCardInput[] = [];
  let zIndex = 0;

  for (let packIdx = 0; packIdx < packs.length; packIdx++) {
    for (let slotIdx = 0; slotIdx < packs[packIdx].cards.length; slotIdx++) {
      const { posX, posY } = toGridPos(packIdx, slotIdx);
      placed.push({
        ...packs[packIdx].cards[slotIdx],
        posX,
        posY,
        zIndex: zIndex++,
      });
    }
  }

  // Promo — standalone, prominent position after all pack columns
  if (promo.cardId) {
    placed.push({
      ...promo,
      posX: PROMO_OFFSET_X,
      posY: PROMO_OFFSET_Y,
      zIndex: zIndex++,
    });
  }

  return placed;
}

// ─── Public API ───────────────────────────────────────────────────────────────────

/**
 * Generates a full prerelease kit and persists it in one transaction:
 *
 * - 5 × Play Booster   (14 cards each)
 * - 1 × Seeded Booster (14 cards, college-filtered, foil promo rare in Slot 2)
 * - 1 × Promo card     (random SOS Rare/Mythic, always foil)
 *
 * Total: **85 cards** — all inserted as `PlacedCard` rows.
 * The promo card ID is also stored on `PrereleaseKit.promoCardId`.
 *
 * @returns The ID of the newly created `PrereleaseKit`.
 * @throws  When the card pool is empty (run the seed script first).
 */
export async function generateFullKit(college: College): Promise<string> {
  const allCards: Card[] = await prisma.card.findMany();

  if (allCards.length === 0) {
    throw new Error(
      "Card pool is empty. Seed the database before generating a kit.",
    );
  }

  // ── Assemble packs ──────────────────────────────────────────────────────────
  const playBoosters = Array.from({ length: 5 }, () =>
    openPlayBooster(allCards),
  );
  const seededBooster = openSeededBooster(allCards, college);
  const allPacks: BoosterPack[] = [...playBoosters, seededBooster];

  // ── Draw promo ──────────────────────────────────────────────────────────────
  const promo = generatePromoCard(allCards);

  // ── Compute grid layout ─────────────────────────────────────────────────────
  const placedInputs = layoutAll(allPacks, promo);

  // ── Expected total: 85 (safety assertion, silent in production) ─────────────
  if (process.env.NODE_ENV !== "production") {
    const realCards = placedInputs.filter((p) => p.cardId !== "");
    if (realCards.length !== 85) {
      console.warn(
        `[engine] Expected 85 placed cards, got ${realCards.length}. ` +
          "Pool may be too small for full deduplication.",
      );
    }
  }

  // ── Single transaction ──────────────────────────────────────────────────────
  const kit = await prisma.$transaction(async (tx) => {
    const created = await tx.prereleaseKit.create({
      data: { college, promoCardId: promo.cardId || null },
    });

    await tx.placedCard.createMany({
      data: placedInputs
        .filter((p) => p.cardId !== "") // skip empty slots from empty pools
        .map((p) => ({
          kitId: created.id,
          cardId: p.cardId,
          posX: p.posX,
          posY: p.posY,
          zIndex: p.zIndex,
          isFoil: p.isFoil,
          isMainDeck: null,
        })),
    });

    return created;
  });

  return kit.id;
}
