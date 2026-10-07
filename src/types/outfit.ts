export type LayerShape = 'robe' | 'collar' | 'belt' | 'skirt' | 'inner' | 'hat' | 'scarf';

export interface BodyMeasurements {
  height: number;
  weight: number;
  chest: number;
  waist: number;
  hips: number;
}

export interface OutfitLayer {
  id: string;
  name: string;
  defaultColor: string;
  allowedPalette: string[];
  zIndex: number;
  shape: LayerShape;
  isOptional?: boolean;
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
