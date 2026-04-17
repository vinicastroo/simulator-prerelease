export const BASIC_COLORS = ["W", "U", "B", "R", "G"] as const;
export type BasicColor = (typeof BASIC_COLORS)[number];

export const BASIC_LAND_NAME: Record<BasicColor, string> = {
  W: "Planície",
  U: "Ilha",
  B: "Pântano",
  R: "Montanha",
  G: "Floresta",
};

export const BASIC_LAND_NAME_EN: Record<BasicColor, string> = {
  W: "Plains",
  U: "Island",
  B: "Swamp",
  R: "Mountain",
  G: "Forest",
};

export const COLOR_SVG: Record<BasicColor, string> = {
  W: "/W.svg",
  U: "/U.svg",
  B: "/B.svg",
  R: "/R.svg",
  G: "/G.svg",
};

export const COLOR_LABEL: Record<BasicColor, string> = {
  W: "Branco",
  U: "Azul",
  B: "Preto",
  R: "Vermelho",
  G: "Verde",
};

export const COLOR_ACCENT: Record<BasicColor, string> = {
  W: "#f9fafb",
  U: "#60a5fa",
  B: "#a78bfa",
  R: "#f87171",
  G: "#4ade80",
};

// ─── Dual pairs ───────────────────────────────────────────────────────────────

export type DualPair = {
  key: string;
  colors: [BasicColor, BasicColor];
  svgPath: string;
  label: string;
};

export const DUAL_PAIRS: DualPair[] = [
  { key: "WU", colors: ["W", "U"], svgPath: "/WU.svg", label: "Branco/Azul" },
  { key: "WB", colors: ["W", "B"], svgPath: "/WB.svg", label: "Branco/Preto" },
  { key: "WR", colors: ["W", "R"], svgPath: "/RW.svg", label: "Branco/Vermelho" },
  { key: "WG", colors: ["W", "G"], svgPath: "/GW.svg", label: "Branco/Verde" },
  { key: "UB", colors: ["U", "B"], svgPath: "/UB.svg", label: "Azul/Preto" },
  { key: "UR", colors: ["U", "R"], svgPath: "/UR.svg", label: "Azul/Vermelho" },
  { key: "UG", colors: ["U", "G"], svgPath: "/GU.svg", label: "Azul/Verde" },
  { key: "BR", colors: ["B", "R"], svgPath: "/BR.svg", label: "Preto/Vermelho" },
  { key: "BG", colors: ["B", "G"], svgPath: "/BG.svg", label: "Preto/Verde" },
  { key: "RG", colors: ["R", "G"], svgPath: "/RG.svg", label: "Vermelho/Verde" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

export type ColorPips = Partial<Record<BasicColor, number>>;
export type DualCounts = Partial<Record<string, number>>;
export type LandRecommendation = Record<BasicColor, number>;

// ─── Core algorithm ───────────────────────────────────────────────────────────

/**
 * Recommend basic land quantities for a limited deck.
 *
 * Each dual land absorbs pip demand from its two colors proportionally, then the
 * remaining effective pips determine how basics are split.
 *
 * @param pips        Colored mana pips per color
 * @param dualCounts  How many of each dual pair are in the deck (e.g. { WU: 2, BR: 1 })
 * @param utility     Colorless utility lands that occupy budget but don't help any color
 * @param landBudget  Total lands the deck should run (default 17 for limited)
 */
export function recommendBasicLands(
  pips: ColorPips,
  dualCounts: DualCounts = {},
  utility = 0,
  landBudget = 17,
): LandRecommendation {
  const result: LandRecommendation = { W: 0, U: 0, B: 0, R: 0, G: 0 };
  const totalPips = BASIC_COLORS.reduce((s, c) => s + (pips[c] ?? 0), 0);
  if (totalPips === 0) return result;

  // Each dual land covers pip demand from its two colors in proportion to how many
  // pips each color contributes to their combined total.
  const effectivePips: Record<BasicColor, number> = {
    W: pips.W ?? 0,
    U: pips.U ?? 0,
    B: pips.B ?? 0,
    R: pips.R ?? 0,
    G: pips.G ?? 0,
  };

  let totalDuals = 0;
  for (const pair of DUAL_PAIRS) {
    const count = dualCounts[pair.key] ?? 0;
    if (count === 0) continue;
    totalDuals += count;
    const [a, b] = pair.colors;
    const sumAB = (pips[a] ?? 0) + (pips[b] ?? 0);
    if (sumAB > 0) {
      effectivePips[a] = Math.max(0, effectivePips[a] - count * (pips[a] ?? 0) / sumAB);
      effectivePips[b] = Math.max(0, effectivePips[b] - count * (pips[b] ?? 0) / sumAB);
    }
  }

  const budget = Math.max(0, landBudget - totalDuals - utility);
  const totalEffective = BASIC_COLORS.reduce((s, c) => s + effectivePips[c], 0);
  if (totalEffective === 0) return result;

  const usedColors = BASIC_COLORS.filter((c) => effectivePips[c] > 0);
  const raw: Partial<Record<BasicColor, number>> = {};
  for (const col of usedColors) {
    raw[col] = (effectivePips[col] / totalEffective) * budget;
  }

  for (const col of usedColors) result[col] = Math.floor(raw[col] ?? 0);
  const remaining = budget - usedColors.reduce((s, col) => s + result[col], 0);
  const byFrac = [...usedColors].sort(
    (a, b) => ((raw[b] ?? 0) % 1) - ((raw[a] ?? 0) % 1),
  );
  for (let i = 0; i < remaining && i < byFrac.length; i++) {
    result[byFrac[i]]++;
  }

  return result;
}
