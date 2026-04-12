/**
 * Presentation-layer data for the five Strixhaven colleges.
 * Updated with official hex colors and local mana SVGs.
 */

export type MtgColor = "W" | "U" | "B" | "R" | "G";

export type CollegeColor = {
  code: MtgColor;
  label: string;
  svgPath: string; // Caminho para o SVG em /public
};

export type CollegeTheme = {
  gradientFrom: string;
  gradientTo: string;
  glowColor: string;
  ringClass: string;
  accentClass: string;
  borderClass: string;
};

export type CollegeDef = {
  id: "LOREHOLD" | "PRISMARI" | "QUANDRIX" | "SILVERQUILL" | "WITHERBLOOM";
  name: string;
  school: string;
  tagline: string;
  strategy: string;
  keywords: string[];
  colors: CollegeColor[];
  theme: CollegeTheme;
  logoPath: string;
};

// ── Mana Symbols mapping (pointing to your /public/*.svg files) ──────────────

const PIPS: Record<MtgColor, CollegeColor> = {
  W: { code: "W", label: "White", svgPath: "/W.svg" },
  U: { code: "U", label: "Blue", svgPath: "/U.svg" },
  B: { code: "B", label: "Black", svgPath: "/B.svg" },
  R: { code: "R", label: "Red", svgPath: "/R.svg" },
  G: { code: "G", label: "Green", svgPath: "/G.svg" },
};

// ── College definitions ───────────────────────────────────────────────────────

export const COLLEGES: CollegeDef[] = [
  {
    id: "LOREHOLD",
    name: "Lorehold",
    school: "School of Chaos",
    tagline: "The past is alive — and angry.",
    strategy: "Animate your graveyard. Summon spirit tokens from fallen cards and overrun opponents.",
    keywords: ["Spirits", "Graveyard", "Aggro"],
    colors: [PIPS.R, PIPS.W],
    theme: {
      gradientFrom: "#AF272C",
      gradientTo: "#E3E9C5",
      glowColor: "rgba(175, 39, 44, 0.4)",
      ringClass: "ring-[#AF272C]/70",
      accentClass: "text-[#AF272C]",
      borderClass: "border-[#AF272C]/40",
    },
    logoPath: "/Lorehold_insignia.svg",
  },
  {
    id: "PRISMARI",
    name: "Prismari",
    school: "School of Perfection",
    tagline: "Art is power. Power is art.",
    strategy: "Cast enormous elemental spells that reshape the battlefield. Ramp into game-ending sorceries.",
    keywords: ["Big Spells", "Ramp", "Elemental"],
    colors: [PIPS.U, PIPS.R],
    theme: {
      gradientFrom: "#AF272C",
      gradientTo: "#372C64",
      glowColor: "rgba(175, 39, 44, 0.5)",
      ringClass: "ring-[#372C64]/70",
      accentClass: "text-[#AF272C]",
      borderClass: "border-[#AF272C]/30",
    },
    logoPath: "/Prismari_insignia.svg",
  },
  {
    id: "QUANDRIX",
    name: "Quandrix",
    school: "School of Substance",
    tagline: "Every number hides a creature.",
    strategy: "Multiply lands and fractal tokens exponentially. Build a mathematical army.",
    keywords: ["Fractals", "Ramp", "Tokens"],
    colors: [PIPS.G, PIPS.U],
    theme: {
      gradientFrom: "#2AA149",
      gradientTo: "#392D67",
      glowColor: "rgba(42, 161, 73, 0.5)",
      ringClass: "ring-[#392D67]/70",
      accentClass: "text-[#2AA149]",
      borderClass: "border-[#2AA149]/40",
    },
    logoPath: "/Quandrix_insignia.svg",
  },
  {
    id: "SILVERQUILL",
    name: "Silverquill",
    school: "School of Eloquence",
    tagline: "Words that wound. Words that heal.",
    strategy: "Flood the board with inked spirit tokens and +1/+1 counters. Drain opponents with lifelink.",
    keywords: ["Counters", "Lifelink", "Tokens"],
    colors: [PIPS.W, PIPS.B],
    theme: {
      gradientFrom: "#E4EAC6",
      gradientTo: "#191617",
      glowColor: "rgba(228, 234, 198, 0.3)",
      ringClass: "ring-[#E4EAC6]/50",
      accentClass: "text-[#E4EAC6]",
      borderClass: "border-white/10",
    },
    logoPath: "/Silverquill_insignia.svg",
  },
  {
    id: "WITHERBLOOM",
    name: "Witherbloom",
    school: "School of Essence",
    tagline: "Life is a resource. Spend it wisely.",
    strategy: "Sacrifice creatures to trigger devastating effects, then recoup life with synergies.",
    keywords: ["Sacrifice", "Life Drain", "Midrange"],
    colors: [PIPS.B, PIPS.G],
    theme: {
      gradientFrom: "#2F9E4C",
      gradientTo: "#2E312E",
      glowColor: "rgba(47, 158, 76, 0.4)",
      ringClass: "ring-[#2F9E4C]/70",
      accentClass: "text-[#2F9E4C]",
      borderClass: "border-[#2F9E4C]/30",
    },
    logoPath: "/Witherbloom_insignia.svg",
  },
];