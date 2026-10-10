import { readFileSync, existsSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Missing modules resolve to null only during RED, so assertions show absent behavior.
const catalogModule = await import("../lib/viet-phuc/catalog").catch(() => null);
const stateModule = await import("../lib/viet-phuc/outfit-state").catch(() => null);
const metadataModule = await import("../lib/viet-phuc/garment-metadata").catch(() => null);
const ids = ["ao_dai/red", "nhat_binh/royal_blue", "giao_linh/emerald"];
const raw = (id = ids[0]) => JSON.parse(readFileSync(`public/assets/garments/${id}/garment.json`, "utf8"));

describe("catalog and cultural content", () => {
  it("resolves three distinct outfits with existing real variants and protected clothing", () => {
    expect(catalogModule?.garmentCatalog.map((entry) => entry.id)).toEqual(ids);
    for (const id of ids) {
      const entry = catalogModule?.getGarment(id);
      expect(entry).toBeDefined();
      expect(entry?.requiredLayerIds).toEqual(["pants", "torso"]);
      expect(entry?.optionalAccessories.map((item) => item.id)).toEqual(["necklace", "headpiece"]);
      expect(entry?.variants).toHaveLength(1);
      expect(existsSync(`public${entry?.variants[0].metadataPath}`)).toBe(true);
      expect(entry?.variants[0].id).toBe(id.split("/")[1]);
      expect(entry?.optionalAccessories.map((item) => item.displayName)).toEqual(raw(id).layers.filter((layer: { isOptional: boolean }) => layer.isOptional).map((layer: { name: string }) => layer.name));
      expect(entry?.sources).toEqual([]);
      expect(entry?.review).toMatchObject({ status: "pending", reviewer: null, reviewedAt: null });
    }
  });
  it("resolves known garments for explicitly contemporary occasions", () => {
    expect(catalogModule?.resolveOccasion("le_tot_nghiep")?.map((item) => item.id)).toEqual(["ao_dai/red"]);
    expect(catalogModule?.resolveOccasion("trinh_dien_van_hoa")?.map((item) => item.id)).toEqual(ids);
    expect(catalogModule?.occasionSuggestions.every((occasion) => occasion.claimKind === "contemporary-styling")).toBe(true);
    expect(catalogModule?.resolveOccasion("unknown")).toEqual([]);
  });
});

describe("outfit transitions", () => {
  it("resets the variant, accessories and old failures when selecting another garment", () => {
    const initial = stateModule?.createOutfit("ao_dai/red");
    const hidden = initial && stateModule?.toggleAccessory(initial, "headpiece");
    const failed = hidden && stateModule?.recordLayerFailure(hidden, "ao_dai/red", "necklace");
    const next = failed && stateModule?.selectGarment(failed, "nhat_binh/royal_blue");
    expect(next).toEqual({ garmentId: "nhat_binh/royal_blue", variantId: "royal_blue", accessoryIds: ["necklace", "headpiece"], failedAccessoryIds: [] });
  });
  it("allows callers to hide accessories while always keeping pants and torso", () => {
    const initial = stateModule?.createOutfit("ao_dai/red");
    const hidden = initial && stateModule?.toggleAccessory(initial, "headpiece");
    const triedPants = hidden && stateModule?.toggleAccessory(hidden, "pants");
    const triedTorso = triedPants && stateModule?.toggleAccessory(triedPants, "torso");
    expect(triedTorso && stateModule?.visibleLayerIds(triedTorso)).toEqual(["pants", "torso", "necklace"]);
  });
  it("rejects unknown choices without changing the valid previous state", () => {
    const initial = stateModule?.createOutfit("ao_dai/red");
    expect(initial).toBeDefined();
    expect(initial && stateModule?.selectGarment(initial, "unknown")).toBe(initial);
    expect(initial && stateModule?.selectVariant(initial, "invented")).toBe(initial);
    expect(initial && stateModule?.toggleAccessory(initial, "unknown")).toBe(initial);
    expect(stateModule?.createOutfit("unknown")).toBeNull();
  });
  it("removes only a failed optional image and ignores stale failure events", () => {
    const initial = stateModule?.createOutfit("ao_dai/red");
    const failed = initial && stateModule?.recordLayerFailure(initial, "ao_dai/red", "necklace");
    expect(failed && stateModule?.visibleLayerIds(failed)).toEqual(["pants", "torso", "headpiece"]);
    expect(initial && stateModule?.recordLayerFailure(initial, "ao_dai/red", "torso")).toBe(initial);
    const next = failed && stateModule?.selectGarment(failed, "giao_linh/emerald");
    expect(next && stateModule?.recordLayerFailure(next, "ao_dai/red", "necklace")).toBe(next);
    expect(next && stateModule?.visibleLayerIds(next)).toEqual(["pants", "torso", "necklace", "headpiece"]);
  });
});

describe("metadata validation", () => {
  it("normalizes real metadata into pending notes and authoritative layer names", () => {
    const result = metadataModule?.normalizeGarmentMetadata(raw(), "ao_dai/red", "base_01");
    expect(result?.ok).toBe(true);
    if (!result?.ok) return;
    expect(result.value.name).toBe("Áo dài");
    expect(result.value.layers.find((layer) => layer.layerId === "necklace")?.name).toBe("Kiềng Bạc Chạm Hoa Sen");
    expect(result.value.culturalNotes).toHaveLength(3);
    expect(result.value.culturalNotes.every((note) => note.review.status === "pending" && note.sourceIds.length === 0)).toBe(true);
    expect(result.value.sources).toEqual([]);
    expect(result.value.review).toMatchObject({ status: "pending", reviewer: null, reviewedAt: null });
  });
  it.each([
    ["zero canvas", (data: ReturnType<typeof raw>) => { data.canvas.width = 0; }],
    ["wrong canvas", (data: ReturnType<typeof raw>) => { data.canvas.height = 1024; }],
    ["wrong character", (data: ReturnType<typeof raw>) => { data.characterId = "other"; }],
    ["wrong garment", (data: ReturnType<typeof raw>) => { data.garmentId = "giao_linh/emerald"; }],
    ["missing torso", (data: ReturnType<typeof raw>) => { data.layers = data.layers.filter((layer: { layerId: string }) => layer.layerId !== "torso"); }],
    ["duplicate layers", (data: ReturnType<typeof raw>) => { data.layers.push(data.layers[0]); }],
    ["malformed layers", (data: ReturnType<typeof raw>) => { data.layers[0].renderOrder = "25"; }],
    ["foreign image path", (data: ReturnType<typeof raw>) => { data.layers[0].assetPath = "/assets/garments/giao_linh/emerald/pants.png"; }],
    ["corrupt Vietnamese", (data: ReturnType<typeof raw>) => { data.description = "Trang ph�c"; }],
  ])("rejects %s", (_, mutate) => {
    const data = raw(); mutate(data);
    expect(metadataModule?.normalizeGarmentMetadata(data, "ao_dai/red", "base_01").ok).toBe(false);
  });
  it("withholds metadata unless the loaded identity exactly matches the current selection", () => {
    const result = metadataModule?.normalizeGarmentMetadata(raw(), "ao_dai/red", "base_01");
    const loaded = result?.ok ? result.value : null;
    expect(metadataModule?.metadataForSelection(loaded, "nhat_binh/royal_blue")).toBeNull();
    expect(metadataModule?.metadataForSelection(loaded, "giao_linh/emerald")).toBeNull();
    expect(metadataModule?.metadataForSelection(loaded, "ao_dai/red")?.garmentId).toBe("ao_dai/red");
  });
});
