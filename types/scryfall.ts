// types/scryfall.ts
export interface ScryfallCard {
  id: string;
  name: string;
  rarity: string;
  set: string;
  colors?: string[];
  color_identity: string[];
  cmc: number;
  type_line: string;
  collector_number: string;
  image_uris?: {
    normal: string;
  };
  card_faces?: {
    image_uris?: {
      normal: string;
    };
  }[];
}

export interface ScryfallSearchResponse {
  data: ScryfallCard[];
  has_more: boolean;
  next_page?: string;
}