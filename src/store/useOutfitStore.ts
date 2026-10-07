import { create } from 'zustand';
import { Outfit } from '../types/outfit';
import { OUTFITS_DATA } from '../data/outfits';

interface OutfitStoreState {
  outfits: Outfit[];
  currentOutfitId: string;
  customColors: Record<string, Record<string, string>>;
  selectOutfit: (id: string) => void;
  setLayerColor: (layerId: string, color: string) => void;
  resetColors: (outfitId?: string) => void;
  getCurrentOutfit: () => Outfit;
  getLayerColor: (layerId: string) => string;
}

export const useOutfitStore = create<OutfitStoreState>((set, get) => ({
  outfits: OUTFITS_DATA,
  currentOutfitId: OUTFITS_DATA[0]?.id || '',
  customColors: {},

  selectOutfit: (id: string) => {
    set({ currentOutfitId: id });
  },

  setLayerColor: (layerId: string, color: string) => {
    const { currentOutfitId, customColors } = get();
    set({
      customColors: {
        ...customColors,
        [currentOutfitId]: {
          ...(customColors[currentOutfitId] || {}),
          [layerId]: color,
        },
      },
    });
  },

  resetColors: (outfitId?: string) => {
    const targetId = outfitId || get().currentOutfitId;
    const { customColors } = get();
    const updated = { ...customColors };
    delete updated[targetId];
    set({ customColors: updated });
  },

  getCurrentOutfit: () => {
    const { outfits, currentOutfitId } = get();
    const found = outfits.find((o) => o.id === currentOutfitId);
    return found || outfits[0];
  },

  getLayerColor: (layerId: string) => {
    const outfit = get().getCurrentOutfit();
    const currentCustom = get().customColors[outfit.id]?.[layerId];
    if (currentCustom) {
      return currentCustom;
    }
    const layer = outfit.layers.find((l) => l.id === layerId);
    return layer ? layer.defaultColor : '#FFFFFF';
  },
}));
