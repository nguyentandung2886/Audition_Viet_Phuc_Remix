export type GarmentId = "ao_dai/red" | "nhat_binh/royal_blue" | "giao_linh/emerald";
export type VariantId = "red" | "royal_blue" | "emerald";
export type RequiredLayerId = "pants" | "torso";
export type AccessoryId = "necklace" | "headpiece";
export type LayerId = RequiredLayerId | AccessoryId;
export type CharacterId = "base_01";
export interface CulturalSource {
  id: string; title: string; authorOrInstitution: string; url: string;
  locator: string; accessedAt: string;
}
export interface CulturalReview {
  status: "pending" | "approved" | "rejected";
  reviewer: string | null; reviewedAt: string | null; scope: string;
}
export interface CulturalNote {
  id: string; text: string; claimKind: "historical" | "visual-interpretation";
  sourceIds: string[]; review: CulturalReview;
}
export interface ReviewedText { text: string; sourceIds: string[]; review: CulturalReview }
export interface CulturalCaution extends ReviewedText { affectedFeature: string }
export interface GarmentLayer {
  layerId: LayerId; name: string; renderOrder: number; assetPath: string;
  visible: boolean; isOptional: boolean;
}
export interface GarmentVariant {
  id: VariantId; displayName: string; directory: string; metadataPath: string;
}
export interface OptionalAccessory {
  id: AccessoryId; displayName: string; defaultSelected: boolean;
}
export interface GarmentCatalogEntry {
  id: GarmentId; characterId: CharacterId; shortName: string; displayName: string;
  requiredLayerIds: RequiredLayerId[]; optionalAccessories: OptionalAccessory[];
  variants: GarmentVariant[]; defaultVariantId: VariantId;
  sources: CulturalSource[]; review: CulturalReview; culturalNotes: CulturalNote[];
  periodLabel?: ReviewedText; cautionText?: CulturalCaution;
}
export interface GarmentMetadata {
  garmentId: GarmentId; characterId: CharacterId; name: string;
  canvas: { width: number; height: number }; layers: GarmentLayer[];
  sources: CulturalSource[]; review: CulturalReview; culturalNotes: CulturalNote[];
}
export interface OutfitState {
  garmentId: GarmentId; variantId: VariantId; accessoryIds: AccessoryId[];
  failedAccessoryIds: AccessoryId[];
}
export type OccasionId = "le_tot_nghiep" | "trinh_dien_van_hoa";
export interface OccasionSuggestion {
  id: OccasionId; displayName: string; garmentIds: GarmentId[];
  rationale: string; claimKind: "contemporary-styling";
}
export type SceneNavigationState =
  | { scene: "gallery" }
  | { scene: "fitting-room"; outfit: OutfitState }
  | { scene: "result"; outfit: OutfitState };
