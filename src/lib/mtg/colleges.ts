/**
 * Presentation-layer data for the five Strixhaven colleges.
 * Game-logic color codes live in engine.ts (COLLEGE_COLORS).
 * This file drives the selection UI only.
 */

export type MtgColor = "W" | "U" | "B" | "R" | "G";

export type CollegeColor = {
  code: MtgColor;
  /** Human-readable name shown in the UI */
  label: string;
  /** Tailwind bg + text classes for the pip badge */
  pip: string;
};

export type CollegeTheme = {
  /** Hex stops for the card's background gradient */
  gradientFrom: string;
  gradientTo:   string;
  /** rgba CSS string used in box-shadow on hover */
  glowColor: string;
  /** Tailwind ring class applied on hover/focus */
  ringClass: string;
  /** Tailwind text class for accent labels */
  accentClass: string;
  /** Tailwind border class for the card edge */
  borderClass: string;
};

export type CollegeDef = {
  id:       "LOREHOLD" | "PRISMARI" | "QUANDRIX" | "SILVERQUILL" | "WITHERBLOOM";
  name:     string;
  school:   string;     // "School of ___"
  tagline:  string;     // short poetic phrase
  strategy: string;     // 2-line gameplay description
  keywords: string[];   // badge chips shown on the card
  colors:   CollegeColor[];
  theme:    CollegeTheme;
};

// ── Color pip palette ─────────────────────────────────────────────────────────

const PIPS: Record<MtgColor, CollegeColor> = {
  W: { code: "W", label: "White", pip: "bg-yellow-50  text-yellow-900" },
  U: { code: "U", label: "Blue",  pip: "bg-blue-500   text-white"      },
  B: { code: "B", label: "Black", pip: "bg-neutral-800 text-neutral-200 ring-1 ring-neutral-600" },
  R: { code: "R", label: "Red",   pip: "bg-red-600    text-white"      },
  G: { code: "G", label: "Green", pip: "bg-green-600  text-white"      },
};

// ── College definitions ───────────────────────────────────────────────────────

export const COLLEGES: CollegeDef[] = [
  {
    id:       "LOREHOLD",
    name:     "Lorehold",
    school:   "School of Chaos",
    tagline:  "The past is alive — and angry.",
    strategy:
      "Animate your graveyard. Summon spirit tokens from fallen cards and " +
      "overrun opponents with relentless arqueomantic aggression.",
    keywords: ["Spirits", "Graveyard", "Tokens", "Aggro"],
    colors:   [PIPS.R, PIPS.W],
    theme: {
      gradientFrom: "#1c0700",
      gradientTo:   "#2a1000",
      glowColor:    "rgba(210, 70, 20, 0.5)",
      ringClass:    "ring-red-700/70",
      accentClass:  "text-orange-400",
      borderClass:  "border-red-900/60",
    },
  },
  {
    id:       "PRISMARI",
    name:     "Prismari",
    school:   "School of Perfection",
    tagline:  "Art is power. Power is art.",
    strategy:
      "Cast enormous elemental spells that reshape the battlefield. " +
      "Ramp into game-ending sorceries and counter anything that stands in your way.",
    keywords: ["Big Spells", "Ramp", "Elemental", "Control"],
    colors:   [PIPS.U, PIPS.R],
    theme: {
      gradientFrom: "#00061a",
      gradientTo:   "#0e0018",
      glowColor:    "rgba(50, 100, 240, 0.5)",
      ringClass:    "ring-blue-500/70",
      accentClass:  "text-blue-400",
      borderClass:  "border-blue-900/60",
    },
  },
  {
    id:       "QUANDRIX",
    name:     "Quandrix",
    school:   "School of Substance",
    tagline:  "Every number hides a creature.",
    strategy:
      "Multiply lands and fractal tokens exponentially. " +
      "Build a mathematical army that grows beyond what opponents can answer.",
    keywords: ["Fractals", "Ramp", "Tokens", "Midrange"],
    colors:   [PIPS.G, PIPS.U],
    theme: {
      gradientFrom: "#001410",
      gradientTo:   "#001820",
      glowColor:    "rgba(0, 160, 140, 0.5)",
      ringClass:    "ring-teal-500/70",
      accentClass:  "text-teal-300",
      borderClass:  "border-teal-900/60",
    },
  },
  {
    id:       "SILVERQUILL",
    name:     "Silverquill",
    school:   "School of Eloquence",
    tagline:  "Words that wound. Words that heal.",
    strategy:
      "Flood the board with inked spirit tokens and +1/+1 counters. " +
      "Drain opponents with lifelink and punish them for answering your threats.",
    keywords: ["+1/+1 Counters", "Lifelink", "Tokens", "Midrange"],
    colors:   [PIPS.W, PIPS.B],
    theme: {
      gradientFrom: "#0a0a10",
      gradientTo:   "#12101a",
      glowColor:    "rgba(180, 175, 220, 0.4)",
      ringClass:    "ring-slate-400/60",
      accentClass:  "text-slate-300",
      borderClass:  "border-slate-700/50",
    },
  },
  {
    id:       "WITHERBLOOM",
    name:     "Witherbloom",
    school:   "School of Essence",
    tagline:  "Life is a resource. Spend it wisely.",
    strategy:
      "Sacrifice creatures to trigger devastating effects, then recoup " +
      "life with lifegain synergies. Every death fuels the next threat.",
    keywords: ["Sacrifice", "Life Drain", "Graveyard", "Midrange"],
    colors:   [PIPS.B, PIPS.G],
    theme: {
      gradientFrom: "#010801",
      gradientTo:   "#080200",
      glowColor:    "rgba(50, 140, 60, 0.5)",
      ringClass:    "ring-green-700/70",
      accentClass:  "text-green-400",
      borderClass:  "border-green-900/60",
    },
  },
];
