"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { CardDefinition, CardInstance, ZoneName } from "@/lib/game/types";
import { useGameStore } from "../hooks/useGameStore";

type DeckGroup = {
  key: string;
  definition: CardDefinition;
  count: number;
};

const MAIN_DECK_ZONES: ZoneName[] = [
  "library",
  "hand",
  "battlefield",
  "graveyard",
  "exile",
  "command",
];

const MANA_ICON_SRC: Record<string, string> = {
  // Generic
  "0": "/0.svg", "1": "/1.svg", "2": "/2.svg", "3": "/3.svg", "4": "/4.svg",
  "5": "/5.svg", "6": "/6.svg", "7": "/7.svg", "8": "/8.svg", "9": "/9.svg",
  "10": "/10.svg", "11": "/11.svg", "12": "/12.svg", "13": "/13.svg",
  "14": "/14.svg", "15": "/15.svg", "16": "/16.svg", "17": "/17.svg",
  "18": "/18.svg", "19": "/19.svg", "20": "/20.svg",
  X: "/X.svg",
  // Basic colors
  W: "/W.svg", U: "/U.svg", B: "/B.svg", R: "/R.svg", G: "/G.svg",
  C: "/C.svg",
  // Hybrid
  "W/U": "/WU.svg", "W/B": "/WB.svg",
  "U/B": "/UB.svg", "U/R": "/UR.svg",
  "B/R": "/BR.svg", "B/G": "/BG.svg",
  "R/G": "/RG.svg", "R/W": "/RW.svg",
  "G/W": "/GW.svg", "G/U": "/GU.svg",
  // 2/color hybrid
  "2/W": "/2W.svg", "2/U": "/2U.svg", "2/B": "/2B.svg",
  "2/R": "/2R.svg", "2/G": "/2G.svg",
  // Phyrexian
  "W/P": "/WP.svg", "U/P": "/UP.svg", "B/P": "/BP.svg",
  "R/P": "/RP.svg", "G/P": "/GP.svg",
  // Hybrid phyrexian
  "W/U/P": "/WUP.svg", "W/B/P": "/WBP.svg",
  "U/B/P": "/UBP.svg", "U/R/P": "/URP.svg",
  "B/R/P": "/BRP.svg", "B/G/P": "/BGP.svg",
  "R/G/P": "/RGP.svg", "R/W/P": "/RWP.svg",
  "G/W/P": "/GWP.svg", "G/U/P": "/GUP.svg",
  // Colorless hybrid
  "C/W": "/CW.svg", "C/U": "/CU.svg", "C/B": "/CB.svg",
  "C/R": "/CR.svg", "C/G": "/CG.svg",
};

function parseManaCost(cost?: string | null): string[] {
  if (!cost) return [];

  return Array.from(cost.matchAll(/\{([^}]+)\}/g), ([, token]) =>
    token.toUpperCase(),
  );
}

function groupDeckCards(
  cards: CardInstance[],
  cardWithDef: ReturnType<typeof useGameStore>["cardWithDef"],
) {
  const groups = new Map<string, DeckGroup>();

  for (const card of cards) {
    const entry = cardWithDef(card.id);
    if (!entry) continue;

    const existing = groups.get(entry.definition.id);
    if (existing) {
      existing.count += 1;
      continue;
    }

    groups.set(entry.definition.id, {
      key: entry.definition.id,
      definition: entry.definition,
      count: 1,
    });
  }

  return Array.from(groups.values()).sort((a, b) => {
    const aIsLand = a.definition.type.toLowerCase().includes("land");
    const bIsLand = b.definition.type.toLowerCase().includes("land");

    if (aIsLand !== bIsLand) return aIsLand ? 1 : -1;
    return a.definition.name.localeCompare(b.definition.name);
  });
}

function SummaryMetricRow({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <p
        className={`font-mono text-[8px] uppercase tracking-[0.1em] ${accent ? "text-[#8ea4d6]" : "text-white/34"}`}
      >
        {label}
      </p>
      <p
        className={`font-mono text-[11px] font-semibold tabular-nums ${accent ? "text-[#d8e4ff]" : "text-white/72"}`}
      >
        {value}
      </p>
    </div>
  );
}

function EmptySlot({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center rounded-b-[22px] bg-[#14181b]/78 px-4 py-8">
      <div className="flex w-full items-center justify-center rounded-[18px] border border-dashed border-[#30476f]/35 bg-[#10151b]/55 px-4 py-6">
        <p className="text-center font-mono text-[10px] uppercase tracking-[0.18em] text-white/26">
          {message}
        </p>
      </div>
    </div>
  );
}

function ManaCost({ cost }: { cost?: string | null }) {
  const tokenEntries = parseManaCost(cost).map((token, index) => ({
    token,
    key: `${token}-${index}`,
  }));

  if (tokenEntries.length === 0) {
    return (
      <span className="font-mono text-[8px] uppercase text-white/24">-</span>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {tokenEntries.map(({ token, key }) => {
        const src = MANA_ICON_SRC[token];

        if (!src) {
          return (
            <span
              key={key}
              className="font-mono text-[8px] uppercase text-white/24"
            >
              {token}
            </span>
          );
        }

        return (
          <span
            key={key}
            className="relative h-2.5 w-2.5 flex-shrink-0 opacity-85"
          >
            <Image src={src} alt={token} fill className="object-contain" />
          </span>
        );
      })}
    </div>
  );
}

function DeckRow({ group }: { group: DeckGroup }) {
  const isLand = group.definition.type.toLowerCase().includes("land");

  return (
    <li className="group relative flex w-full items-center gap-2.5 border-b border-[#30476f]/40 px-3 py-2.5 transition-all last:border-b-0 hover:bg-white/[0.045]">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <span
          className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${isLand ? "bg-[#7fb08f]" : "bg-[#7f95c9]"}`}
        />

        <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-1.5">
            {group.count > 1 && (
              <span className="font-mono text-[10px] font-semibold leading-none text-[#8ea4d6]">
                {group.count}x
              </span>
            )}

            <span className="truncate text-[12px] leading-none text-white/78">
              {group.definition.name}
            </span>
          </div>

          <div className="flex flex-shrink-0 items-center gap-1.5">
            <ManaCost cost={group.definition.manaCost} />
          </div>
        </div>
      </div>
    </li>
  );
}

function DeckSection({
  label,
  count,
  description,
  groups,
}: {
  label: string;
  count: number;
  description: string;
  groups: DeckGroup[];
}) {
  return (
    <Card className="overflow-hidden rounded-[22px] border border-[#30476f]/30 bg-[#15191d]/88 shadow-none ring-0">
      <CardHeader className="border-b border-[#30476f]/30 pb-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-[#7f95c9]">
              {label}
            </CardTitle>
            <CardDescription className="mt-1 text-[10px] text-white/28">
              {description}
            </CardDescription>
          </div>
          <span className="rounded-full border border-[#30476f]/45 bg-[#162032]/75 px-2 py-1 font-mono text-[10px] text-[#b7c5e8]">
            {count}
          </span>
        </div>
      </CardHeader>

      {groups.length === 0 ? (
        <EmptySlot message="Nenhuma carta nesta lista" />
      ) : (
        <ul className="flex flex-col overflow-hidden rounded-b-[22px] bg-[#14181b]/78 shadow-[0_0_0_1px_rgba(49,69,111,0.34)]">
          {groups.map((group) => (
            <DeckRow key={group.key} group={group} />
          ))}
        </ul>
      )}
    </Card>
  );
}

export function PlaytestSidebar() {
  const { allZones, cardWithDef, zoneCount, player } = useGameStore();

  const mainDeckCards = MAIN_DECK_ZONES.flatMap((zone) => allZones[zone]);
  const sideboardCards = allZones.sideboard;
  const mainDeck = groupDeckCards(mainDeckCards, cardWithDef);
  const sideboard = groupDeckCards(sideboardCards, cardWithDef);
  const landCount = mainDeckCards.filter((card) => {
    const entry = cardWithDef(card.id);
    return entry?.definition.type.toLowerCase().includes("land") ?? false;
  }).length;
  const spellCount = mainDeckCards.length - landCount;
  const creatureCount = mainDeckCards.filter((card) => {
    const entry = cardWithDef(card.id);
    return entry?.definition.type.toLowerCase().includes("creature") ?? false;
  }).length;

  return (
    <aside className="relative flex h-full min-w-[300px] w-[300px] flex-col overflow-hidden border-l border-[#2a3f66]/55 bg-[#121416]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(74,98,153,0.18),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_18%)]" />

      <div className="relative flex items-start justify-between border-b border-[#2f446d]/45 px-4 py-4 flex-shrink-0">
        <div>
          <Badge
            variant="outline"
            className="border-[#30476f]/55 bg-[#162032]/70 text-[#9bb0e0]"
          >
            Playtest
          </Badge>
          <h2 className="mt-2 text-[#e5edff] font-semibold tracking-wider text-sm uppercase">
            Deck Reference
          </h2>
          <p className="text-white/35 text-[11px] mt-0.5">
            {player?.name ?? "Você"} • lista sincronizada com o simulador
          </p>
        </div>
      </div>

      <ScrollArea className="relative h-0 flex-1 [scrollbar-color:#31456f_transparent] [scrollbar-width:thin]">
        <div className="min-h-full px-3 pb-3 pt-8">
          <Card className="overflow-hidden rounded-[22px] border border-[#30476f]/30 bg-[#15191d]/88 shadow-none ring-0">
            <CardHeader className="border-b border-[#30476f]/30 pb-2">
              <CardTitle className="font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-[#7f95c9]">
                Resumo do Deck
              </CardTitle>
              <CardDescription className="text-[10px] text-white/28">
                Estado atual da partida e da build principal
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-1.5 pt-3">
              <SummaryMetricRow
                label="Total"
                value={`${mainDeckCards.length}${sideboardCards.length > 0 ? ` + ${sideboardCards.length}` : ""}`}
                accent
              />
              <Separator className="bg-[#30476f]/30" />
              <SummaryMetricRow label="Main" value={mainDeckCards.length} />
              <SummaryMetricRow
                label="Sideboard"
                value={sideboardCards.length}
              />
              <SummaryMetricRow label="Criaturas" value={creatureCount} />
              <SummaryMetricRow label="Feitiços" value={spellCount} />
              <SummaryMetricRow label="Terrenos" value={landCount} />
              <Separator className="bg-[#30476f]/30" />
              <SummaryMetricRow label="Na mao" value={zoneCount("hand")} />
              <SummaryMetricRow
                label="Em campo"
                value={zoneCount("battlefield")}
              />
              <SummaryMetricRow
                label="Graveyard"
                value={zoneCount("graveyard")}
              />
              <SummaryMetricRow label="Exile" value={zoneCount("exile")} />
            </CardContent>
          </Card>

          <DeckSection
            label="Main Deck"
            count={mainDeckCards.length}
            description="Mesmo agrupamento da lista que voce montou no simulador"
            groups={mainDeck}
          />

          <DeckSection
            label="Sideboard"
            count={sideboardCards.length}
            description="Reserva separada para consulta durante o playtest"
            groups={sideboard}
          />
        </div>
      </ScrollArea>
    </aside>
  );
}
