import { getGarment } from "./catalog";
import type { AccessoryId, LayerId, OutfitState } from "./types";

export function createOutfit(garmentId: string): OutfitState | null {
  const garment = getGarment(garmentId);
  if (!garment) return null;
  return {
    garmentId: garment.id, variantId: garment.defaultVariantId,
    accessoryIds: garment.optionalAccessories.filter((item) => item.defaultSelected).map((item) => item.id),
    failedAccessoryIds: [],
  };
}

export function selectGarment(state: OutfitState, garmentId: string): OutfitState {
  if (state.garmentId === garmentId) return state;
  return createOutfit(garmentId) ?? state;
}

export function selectVariant(state: OutfitState, variantId: string): OutfitState {
  const variant = getGarment(state.garmentId)?.variants.find((item) => item.id === variantId);
  return variant ? { ...state, variantId: variant.id } : state;
}

export function toggleAccessory(state: OutfitState, accessoryId: string): OutfitState {
  const accessory = getGarment(state.garmentId)?.optionalAccessories.find((item) => item.id === accessoryId);
  if (!accessory) return state;
  return {
    ...state,
    accessoryIds: state.accessoryIds.includes(accessory.id)
      ? state.accessoryIds.filter((id) => id !== accessory.id) : [...state.accessoryIds, accessory.id],
  };
}

export function recordLayerFailure(state: OutfitState, garmentId: string, layerId: string): OutfitState {
  if (garmentId !== state.garmentId) return state;
  const accessory = getGarment(garmentId)?.optionalAccessories.find((item) => item.id === layerId);
  if (!accessory || state.failedAccessoryIds.includes(accessory.id)) return state;
  return { ...state, failedAccessoryIds: [...state.failedAccessoryIds, accessory.id] };
}

export function visibleLayerIds(state: OutfitState): LayerId[] {
  const garment = getGarment(state.garmentId);
  if (!garment) return ["pants", "torso"];
  const accessories: AccessoryId[] = garment.optionalAccessories
    .filter((item) => state.accessoryIds.includes(item.id) && !state.failedAccessoryIds.includes(item.id))
    .map((item) => item.id);
  return [...garment.requiredLayerIds, ...accessories];
}
