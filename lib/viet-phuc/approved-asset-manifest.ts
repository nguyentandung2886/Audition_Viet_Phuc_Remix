export type AssetReviewState = "pending" | "accepted-source-pending-derivative-review";

export interface ApprovedAssetReview {
  status: "draft";
  technical: "pending";
  visual: AssetReviewState;
  cultural: "pending";
}

export interface ApprovedAssetLayer {
  layerId: "background" | "foreground" | "pants" | "torso" | "necklace" | "headpiece";
  assetPath: string;
  renderOrder: number;
  required?: boolean;
  width: number;
  height: number;
  sourceVersion?: string;
  checksumSha256: string;
}

export interface ApprovedSceneAssetManifest {
  schemaVersion: 1;
  sceneId: "ao_dai";
  version: `v${number}`;
  canvas: { width: 1600; height: 1000 };
  desktopCrop: { x: number; y: number; width: number; height: number };
  mobileCrop: { x: number; y: number; width: number; height: number };
  characterBounds: { x: number; y: number; width: number; height: number };
  layers: ApprovedAssetLayer[];
  review: ApprovedAssetReview;
}

export interface ApprovedGarmentAssetManifest {
  schemaVersion: 1;
  garmentId: "ao_dai";
  variantId: "red" | "indigo";
  version: `v${number}`;
  canvas: { width: 1024; height: 1536 };
  normalizationBox: { left: number; top: number; right: number; bottom: number };
  visibleBounds: { left: number; top: number; right: number; bottom: number };
  layerNormalization: Record<
    "pants" | "torso" | "necklace" | "headpiece",
    {
      box: { left: number; top: number; right: number; bottom: number };
      visibleBounds: { left: number; top: number; right: number; bottom: number };
    }
  >;
  layers: ApprovedAssetLayer[];
  review: ApprovedAssetReview;
}

export const APPROVED_AO_DAI_ASSET_MANIFESTS = {
  scene: "/assets/approved/scenes/ao_dai/scene.json",
  red: "/assets/approved/garments/ao_dai/red/garment.json",
  indigo: "/assets/approved/garments/ao_dai/indigo/garment.json",
} as const;
