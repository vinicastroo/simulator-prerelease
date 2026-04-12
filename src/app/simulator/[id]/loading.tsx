/**
 * Simulator loading skeleton — shown by Next.js while the Server Component
 * fetches and renders the kit data from SQLite.
 *
 * Replicates the visual shape of the canvas (6 pack columns + promo)
 * so the layout doesn't jump when the real content loads.
 */

const PACKS = 6; // 5 play + 1 seeded
const CARDS_PER_COL = 14;
const CARD_W = 130;
const CARD_H = 182;
const COL_GAP = 20;
const ROW_GAP = 12;
const ORIGIN_X = 24;
const ORIGIN_Y = 24;
const PROMO_X = ORIGIN_X + PACKS * (CARD_W + COL_GAP) + 40;
const PACK_SKELETON_CARDS = Array.from({ length: PACKS }, (_, col) =>
  Array.from({ length: CARDS_PER_COL }, (_, row) => ({
    key: `pack-${col}-card-${row}`,
    col,
    row,
    delay: (col * CARDS_PER_COL + row) * 18,
    isSeeded: col === PACKS - 1,
  })),
).flat();
const PROGRESS_DOTS = ["dot-0", "dot-1", "dot-2", "dot-3", "dot-4", "dot-5"];
const SIDEBAR_ROWS = [
  "row-0",
  "row-1",
  "row-2",
  "row-3",
  "row-4",
  "row-5",
  "row-6",
  "row-7",
  "row-8",
  "row-9",
  "row-10",
  "row-11",
];

export default function SimulatorLoading() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-void">
      {/* ── Canvas skeleton ─────────────────────────────────────────────── */}
      <div className="relative flex-1 overflow-hidden">
        {/* Faint grid — matches CanvasContainer */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(77,99,147,1) 1px, transparent 1px), " +
              "linear-gradient(90deg, rgba(77,99,147,1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Pack columns */}
        {PACK_SKELETON_CARDS.map(({ key, col, row, delay, isSeeded }) => (
          <div
            key={key}
            aria-hidden
            className="absolute rounded-[7px] skeleton-wave"
            style={{
              width: CARD_W,
              height: CARD_H,
              left: ORIGIN_X + col * (CARD_W + COL_GAP),
              top: ORIGIN_Y + row * (CARD_H + ROW_GAP),
              animationDelay: `${delay}ms`,
              // Seeded booster column is slightly brighter
              filter: isSeeded ? "brightness(1.25)" : undefined,
              // Subtle blue ring on first row to hint at structure
              boxShadow:
                row === 0 && isSeeded
                  ? "0 0 0 1px rgba(77,99,147,0.32)"
                  : undefined,
            }}
          />
        ))}

        {/* Promo card skeleton */}
        <div
          aria-hidden
          className="absolute rounded-[7px] skeleton-wave"
          style={{
            width: CARD_W,
            height: CARD_H,
            left: PROMO_X,
            top: ORIGIN_Y,
            animationDelay: `${PACKS * CARDS_PER_COL * 18}ms`,
            boxShadow: "0 0 0 1px rgba(77,99,147,0.4)",
          }}
        />

        {/* ── Central overlay ─────────────────────────────────────────────── */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-void/65 gap-5">
          <PackIcon className="w-12 h-12 text-gold-accent/70 animate-bounce" />
          <div className="flex flex-col items-center gap-2">
            <p className="text-gold-accent text-sm font-semibold tracking-[0.25em] uppercase animate-pulse">
              Opening Packs…
            </p>
            <p className="text-white/30 text-xs tracking-wide">
              Shuffling 85 cards into your prerelease kit
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex gap-1.5 mt-1">
            {PROGRESS_DOTS.map((dotId, i) => (
              <span
                key={dotId}
                className="w-1.5 h-1.5 rounded-full bg-gold-accent/50 animate-pulse"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Sidebar skeleton ────────────────────────────────────────────────── */}
      <aside
        className="flex flex-col h-full border-l border-gold-accent/20 bg-silverquill-ink shrink-0"
        style={{ width: 300 }}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gold-accent/20">
          <div className="h-4 w-24 rounded skeleton-wave" />
        </div>

        {/* Section label */}
        <div className="px-4 py-2 bg-bg-void/40">
          <div className="h-3 w-20 rounded skeleton-wave" />
        </div>

        {/* Card rows */}
        {SIDEBAR_ROWS.map((rowId, i) => (
          <div
            key={rowId}
            className="flex items-center gap-3 px-4 py-2 border-b border-white/[0.03]"
          >
            <div className="w-2 h-2 rounded-full skeleton-wave shrink-0" />
            <div
              className="flex-1 h-3 rounded skeleton-wave"
              style={{ animationDelay: `${i * 60}ms` }}
            />
            <div className="w-4 h-3 rounded skeleton-wave" />
          </div>
        ))}
      </aside>
    </div>
  );
}

// ── Pack icon (SVG) ───────────────────────────────────────────────────────────

function PackIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Pack body */}
      <rect x="8" y="14" width="32" height="28" rx="3" />
      {/* Flap */}
      <path d="M8 22 Q24 30 40 22" />
      {/* Top fold */}
      <path d="M14 14 L14 8 Q24 4 34 8 L34 14" />
      {/* Star / symbol */}
      <path d="M24 20 l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6z" />
    </svg>
  );
}
