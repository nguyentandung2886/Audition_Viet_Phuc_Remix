import { getGarment, pendingReview } from "./catalog";
import type { CulturalNote, GarmentLayer, GarmentMetadata, LayerId } from "./types";

type ValidationResult = { ok: true; value: GarmentMetadata } | { ok: false; error: string };
const record = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0 && !value.includes("\uFFFD");
function corruptString(value: unknown): boolean {
  if (typeof value === "string") return value.includes("\uFFFD");
  if (Array.isArray(value)) return value.some(corruptString);
  return record(value) && Object.values(value).some(corruptString);
}

export function normalizeGarmentMetadata(input: unknown, garmentId: string, characterId: string): ValidationResult {
  const invalid: ValidationResult = { ok: false, error: "Thông tin trang phục chưa sẵn sàng. Vui lòng thử lại." };
  const garment = getGarment(garmentId);
  if (!garment || characterId !== garment.characterId || !record(input) || corruptString(input)) return invalid;
  if (input.garmentId !== garmentId || input.characterId !== characterId || !text(input.name)) return invalid;
  if (!record(input.canvas) || input.canvas.width !== 1024 || input.canvas.height !== 1536) return invalid;
  if (!Array.isArray(input.layers)) return invalid;
  const allowedIds: LayerId[] = [...garment.requiredLayerIds, ...garment.optionalAccessories.map((item) => item.id)];
  const layers: GarmentLayer[] = [];
  const seen = new Set<string>();
  for (const layer of input.layers) {
    if (!record(layer) || !text(layer.layerId) || !allowedIds.includes(layer.layerId as LayerId) || seen.has(layer.layerId)) return invalid;
    if (!text(layer.name) || typeof layer.renderOrder !== "number" || !Number.isFinite(layer.renderOrder)) return invalid;
    if (layer.assetPath !== `${garment.variants[0].directory}/${layer.layerId}.png`) return invalid;
    if (typeof layer.visible !== "boolean" || typeof layer.isOptional !== "boolean") return invalid;
    const isOptional = !garment.requiredLayerIds.includes(layer.layerId as "pants" | "torso");
    if (layer.isOptional !== isOptional) return invalid;
    seen.add(layer.layerId);
    layers.push({ layerId: layer.layerId as LayerId, name: layer.name, renderOrder: layer.renderOrder,
      assetPath: layer.assetPath as string, isOptional, visible: isOptional ? layer.visible : true });
  }
  if (garment.requiredLayerIds.some((id) => !seen.has(id))) return invalid;
  const culturalNotes: CulturalNote[] = [];
  for (const field of ["dynasty", "description", "historicalFact"] as const) {
    if (input[field] !== undefined) {
      if (!text(input[field])) return invalid;
      culturalNotes.push({ id: `${garmentId}:${field}`, text: input[field], claimKind: "historical", sourceIds: [], review: { ...pendingReview } });
    }
  }
  return { ok: true, value: {
    garmentId: garment.id, characterId: garment.characterId, name: garment.shortName,
    canvas: { width: 1024, height: 1536 }, layers: layers.sort((a, b) => a.renderOrder - b.renderOrder),
    sources: [], review: { ...pendingReview }, culturalNotes,
  } };
}

export function metadataForSelection(loaded: GarmentMetadata | null, selectedGarmentId: string | null | undefined): GarmentMetadata | null {
  return loaded?.garmentId === selectedGarmentId ? loaded : null;
}
