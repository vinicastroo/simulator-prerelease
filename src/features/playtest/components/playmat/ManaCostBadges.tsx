import Image from "next/image";

type ManaCostBadgesProps = {
  cardId: string;
  symbols: string[];
};

export function ManaCostBadges({ cardId, symbols }: ManaCostBadgesProps) {
  if (symbols.length === 0) return null;

  const occurrences: Record<string, number> = {};
  const keyedSymbols = symbols.map((symbol) => {
    const nextCount = (occurrences[symbol] ?? 0) + 1;
    occurrences[symbol] = nextCount;
    return {
      symbol,
      key: `${cardId}-${symbol}-${nextCount}`,
    };
  });

  return (
    <div className="absolute -left-2 -top-2 z-30 flex items-center -space-x-1">
      {keyedSymbols.map(({ symbol, key }) => (
        <div
          key={key}
          className="flex h-4 w-4 items-center justify-center rounded-full bg-black shadow-md ring-1 ring-white/30"
        >
          <Image
            src={`/${symbol}.svg`}
            alt={symbol}
            width={14}
            height={14}
            className="h-[80%] w-[80%] object-contain"
            draggable={false}
            unoptimized
          />
        </div>
      ))}
    </div>
  );
}
