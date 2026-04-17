import { type NextRequest, NextResponse } from "next/server";
import {
  BASIC_COLORS,
  BASIC_LAND_NAME_EN,
  COLOR_LABEL,
  DUAL_PAIRS,
  type ColorPips,
  type DualCounts,
  recommendBasicLands,
} from "@/lib/mtg/mana-base";

/**
 * POST /api/mana-base
 *
 * Body:
 *   pips      – colored mana pips per color  { W?: number, U?: number, ... }
 *   duals     – dual-land counts per pair    { WU?: number, BR?: number, ... }
 *   utility   – number of colorless utility lands in the deck  (default 0)
 *   budget    – total lands the deck should run  (default 17)
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Body must be an object" }, { status: 400 });
  }

  const { pips: rawPips, duals: rawDuals, utility, budget } = body as Record<string, unknown>;

  // Validate pips
  const pips: ColorPips = {};
  if (rawPips !== undefined) {
    if (typeof rawPips !== "object" || rawPips === null || Array.isArray(rawPips)) {
      return NextResponse.json({ error: "pips must be an object like { W: 8, U: 5 }" }, { status: 400 });
    }
    for (const col of BASIC_COLORS) {
      const val = (rawPips as Record<string, unknown>)[col];
      if (val === undefined) continue;
      if (typeof val !== "number" || val < 0 || !Number.isFinite(val)) {
        return NextResponse.json({ error: `pips.${col} must be a non-negative number` }, { status: 400 });
      }
      pips[col] = val;
    }
  }

  // Validate dual counts
  const dualCounts: DualCounts = {};
  if (rawDuals !== undefined) {
    if (typeof rawDuals !== "object" || rawDuals === null || Array.isArray(rawDuals)) {
      return NextResponse.json({ error: "duals must be an object like { WU: 1, BR: 2 }" }, { status: 400 });
    }
    const validKeys = new Set(DUAL_PAIRS.map((p) => p.key));
    for (const [k, v] of Object.entries(rawDuals as Record<string, unknown>)) {
      if (!validKeys.has(k)) {
        return NextResponse.json({ error: `Unknown dual pair: ${k}` }, { status: 400 });
      }
      if (typeof v !== "number" || v < 0 || !Number.isFinite(v)) {
        return NextResponse.json({ error: `duals.${k} must be a non-negative number` }, { status: 400 });
      }
      dualCounts[k] = Math.floor(v);
    }
  }

  // Validate utility
  let utilityCount = 0;
  if (utility !== undefined) {
    if (typeof utility !== "number" || utility < 0 || !Number.isFinite(utility)) {
      return NextResponse.json({ error: "utility must be a non-negative number" }, { status: 400 });
    }
    utilityCount = Math.floor(utility);
  }

  // Validate budget
  let landBudget = 17;
  if (budget !== undefined) {
    if (typeof budget !== "number" || budget < 1 || budget > 40 || !Number.isFinite(budget)) {
      return NextResponse.json({ error: "budget must be between 1 and 40" }, { status: 400 });
    }
    landBudget = Math.floor(budget);
  }

  const recommendation = recommendBasicLands(pips, dualCounts, utilityCount, landBudget);

  const lands = BASIC_COLORS.filter((c) => recommendation[c] > 0).map((c) => ({
    color: c,
    label: COLOR_LABEL[c],
    name: BASIC_LAND_NAME_EN[c],
    count: recommendation[c],
  }));

  const total = lands.reduce((s, l) => s + l.count, 0);

  return NextResponse.json({ recommendation, lands, total });
}
