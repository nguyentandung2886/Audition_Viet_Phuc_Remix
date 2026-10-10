import type { CulturalReview, GarmentCatalogEntry, GarmentId, OccasionSuggestion, VariantId } from "./types";

export const pendingCulturalCopy = "Bản phối minh họa theo phong cách anime. Nội dung văn hóa đang được kiểm chứng.";
export const pendingReview: CulturalReview = {
  status: "pending", reviewer: null, reviewedAt: null, scope: "legacy-cultural-content-v1",
};

function entry(id: GarmentId, shortName: string, color: string, necklace: string, headpiece: string): GarmentCatalogEntry {
  const variantId = id.split("/")[1] as VariantId;
  const directory = `/assets/garments/${id}`;
  return {
    id, characterId: "base_01", shortName, displayName: shortName,
    requiredLayerIds: ["pants", "torso"], defaultVariantId: variantId,
    variants: [{ id: variantId, displayName: color, directory, metadataPath: `${directory}/garment.json` }],
    optionalAccessories: [
      { id: "necklace", displayName: necklace, defaultSelected: true },
      { id: "headpiece", displayName: headpiece, defaultSelected: true },
    ],
    sources: [], review: { ...pendingReview }, culturalNotes: [],
  };
}

// Accessory labels are transcribed from layers, never the conflicting components record.
export const garmentCatalog: GarmentCatalogEntry[] = [
  entry("ao_dai/red", "Áo dài", "Đỏ", "Kiềng Bạc Chạm Hoa Sen", "Mấn Đội Đầu Hoàng Kim"),
  entry("nhat_binh/royal_blue", "Áo Nhật Bình", "Lam", "Thẻ Bài Ngọc Bội Hoa Sen", "Khăn Vành Hoàng Gia"),
  entry("giao_linh/emerald", "Áo giao lĩnh", "Xanh ngọc", "Thẻ Bài Ngọc Bội Hoa Sen", "Trâm Cài Hoa Sen Ngọc Bích"),
];

export function getGarment(id: string): GarmentCatalogEntry | undefined {
  return garmentCatalog.find((garment) => garment.id === id);
}

export const occasionSuggestions: OccasionSuggestion[] = [
  {
    id: "le_tot_nghiep", displayName: "Lễ tốt nghiệp", garmentIds: ["ao_dai/red"],
    rationale: "Gợi ý phối đồ đương đại cho lễ tốt nghiệp.", claimKind: "contemporary-styling",
  },
  {
    id: "trinh_dien_van_hoa", displayName: "Trình diễn văn hóa",
    garmentIds: ["ao_dai/red", "nhat_binh/royal_blue", "giao_linh/emerald"],
    rationale: "Gợi ý phối đồ đương đại cho một buổi trình diễn văn hóa.", claimKind: "contemporary-styling",
  },
];

export function resolveOccasion(id: string): GarmentCatalogEntry[] {
  return (occasionSuggestions.find((occasion) => occasion.id === id)?.garmentIds ?? [])
    .flatMap((garmentId) => { const garment = getGarment(garmentId); return garment ? [garment] : []; });
}
