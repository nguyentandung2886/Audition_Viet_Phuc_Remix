export type LayerShape = 'robe' | 'collar' | 'belt' | 'skirt' | 'inner' | 'hat' | 'scarf';

export interface OutfitLayer {
  id: string;
  name: string;
  defaultColor: string;
  allowedPalette: string[];
  zIndex: number;
  shape: LayerShape;
}

export interface Outfit {
  id: string;
  name: string;
  dynasty: string;
  gender: 'nu' | 'nam' | 'unisex';
  description: string;
  historicalFact: string;
  layers: OutfitLayer[];
}
