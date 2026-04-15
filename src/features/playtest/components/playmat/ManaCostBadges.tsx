import Image from "next/image";
import { Fragment } from "react";
import { parseManaCost } from "./utils";

type ManaCostBadgesProps = {
  cardId: string;
  manaCost: string;
};

export function ManaCostBadges({ cardId, manaCost }: ManaCostBadgesProps) {
  if (!manaCost) return null;

  const parts = manaCost.split("//").map((part) => parseManaCost(part.trim()));
  const nonEmpty = parts.filter((p) => p.length > 0);
  if (nonEmpty.length === 0) return null;

  return (
    <div className="absolute -left-2 -top-2 z-30 flex items-center gap-0.5">
      {nonEmpty.map((symbols, groupIndex) => {
        const occurrences: Record<string, number> = {};
        const keyed = symbols.map((symbol) => {
          const count = (occurrences[symbol] ?? 0) + 1;
          occurrences[symbol] = count;
          return { symbol, key: `${cardId}-g${groupIndex}-${symbol}-${count}` };
        });

        return (
          <Fragment key={groupIndex}>
            {groupIndex > 0 && (
              <span className="z-10 px-0.5 text-[7px] font-bold text-white/60">
                //
              </span>
            )}
            <div className="flex items-center -space-x-1">
              {keyed.map(({ symbol, key }) => (
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
          </Fragment>
        );
      })}
    </div>
  );
}
