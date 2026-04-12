// types/scryfall.ts
export interface ScryfallCard {
  id: string;
  name: string;
  rarity: string;
  set: string;
  set_name?: string;
  colors?: string[];
  color_identity: string[];
  mana_cost?: string;
  cmc: number;
  type_line: string;
  oracle_text?: string;
  flavor_text?: string;
  power?: string;
  toughness?: string;
  loyalty?: string;
  artist?: string;
  released_at?: string;
  collector_number: string;
  image_uris?: {
    normal: string;
    large?: string;
    png?: string;
  };
  card_faces?: {
    image_uris?: {
      normal: string;
      large?: string;
      png?: string;
    };
  }[];
}

export interface ScryfallSearchResponse {
  data: ScryfallCard[];
  has_more: boolean;
  next_page?: string;
}
