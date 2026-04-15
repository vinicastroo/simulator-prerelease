export const GRID_SIZE = 40;

export type AbilityMarker = {
  id: string;
  label: string;
};

export const ABILITY_MARKERS: AbilityMarker[] = [
  { id: "flying", label: "Voar" },
  { id: "vigilance", label: "Vigilância" },
  { id: "lifelink", label: "Vínculo de vida" },
  { id: "deathtouch", label: "Toque mortal" },
  { id: "firststrike", label: "Iniciativa" },
  { id: "doublestrike", label: "Iniciativa dupla" },
  { id: "trample", label: "Atropelar" },
  { id: "haste", label: "Ímpeto" },
  { id: "hexproof", label: "Hexprova" },
  { id: "indestructible", label: "Indestrutível" },
  { id: "menace", label: "Ameaça" },
  { id: "reach", label: "Alcance" },
  { id: "flash", label: "Lampejo" },
  { id: "ward", label: "Proteção" },
  { id: "defender", label: "Defensor" },
  { id: "prowess", label: "Proeza" },
  { id: "toxic", label: "Tóxico" },
  { id: "summoning-sickness", label: "Doença invoc." },
];

export const ABILITY_MARKER_IDS = new Set(ABILITY_MARKERS.map((m) => m.id));
export const HAND_CARD_WIDTH = 121;
export const HAND_CARD_HEIGHT = 185;
export const BATTLEFIELD_CARD_WIDTH = 121;
export const BATTLEFIELD_CARD_HEIGHT = 185;
export const BATTLEFIELD_ZOOM_MIN = 0.6;
export const BATTLEFIELD_ZOOM_MAX = 1.8;
export const BATTLEFIELD_ZOOM_STEP = 0.08;
export const BATTLEFIELD_CANVAS_SIZE = 4000;
