import { access, readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const asset = (...parts: string[]) =>
  path.join(root, "public", "assets", "approved", ...parts);
const publicAssetPath = (webPath: string) =>
  path.join(root, "public", webPath.replace(/^[/\\]+/, ""));

const sceneManifestPath = asset("scenes", "ao_dai", "scene.json");
const redManifestPath = asset(
  "garments",
  "ao_dai",
  "red",
  "garment.json",
);
const indigoManifestPath = asset(
  "garments",
  "ao_dai",
  "indigo",
  "garment.json",
);

async function alphaChannel(filePath: string) {
  const { data, info } = await sharp(filePath)
    .ensureAlpha()
    .extractChannel("alpha")
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { alpha: data, width: info.width, height: info.height };
}

describe("approved asset pipeline", () => {
  it("publishes normalized room plates and complete traceable scene metadata", async () => {
    const manifest = JSON.parse(await readFile(sceneManifestPath, "utf8"));

    expect(manifest).toMatchObject({
      schemaVersion: 1,
      sceneId: "ao_dai",
      version: "v001",
      canvas: { width: 1600, height: 1000 },
      desktopCrop: { x: 0, y: 0, width: 1600, height: 1000 },
      mobileCrop: { x: 400, y: 0, width: 800, height: 1000 },
      characterBounds: { x: 584, y: 200, width: 432, height: 648 },
      review: { technical: "pending", cultural: "pending" },
    });
    expect(manifest.provenance.sourceTool).toBe("built-in image_gen");
    expect(manifest.layers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          layerId: "background",
          renderOrder: 0,
          width: 1600,
          height: 1000,
        }),
        expect.objectContaining({
          layerId: "foreground",
          renderOrder: 30,
          width: 1600,
          height: 1000,
        }),
      ]),
    );

    for (const layer of manifest.layers) {
      expect(layer.assetPath).toMatch(/^\/assets\//);
      await access(publicAssetPath(layer.assetPath));
      const metadata = await sharp(publicAssetPath(layer.assetPath)).metadata();
      expect([metadata.width, metadata.height]).toEqual([1600, 1000]);
    }
  });

  it("preserves transparent corners on the room foreground", async () => {
    const { alpha, width, height } = await alphaChannel(
      asset("scenes", "ao_dai", "foreground.png"),
    );
    const corners = [0, width - 1, (height - 1) * width, width * height - 1];
    expect(corners.map((index) => alpha[index])).toEqual([0, 0, 0, 0]);
  });

  it("publishes both colors with pixel-identical layer geometry", async () => {
    for (const layerId of ["pants", "torso", "necklace", "headpiece"]) {
      const red = await alphaChannel(
        asset("garments", "ao_dai", "red", `${layerId}.png`),
      );
      const indigo = await alphaChannel(
        asset("garments", "ao_dai", "indigo", `${layerId}.png`),
      );

      expect([red.width, red.height]).toEqual([1024, 1536]);
      expect([indigo.width, indigo.height]).toEqual([1024, 1536]);
      expect(Buffer.compare(red.alpha, indigo.alpha)).toBe(0);
      const cornerIndexes = [
        0,
        red.width - 1,
        (red.height - 1) * red.width,
        red.width * red.height - 1,
      ];
      expect(cornerIndexes.map((index) => red.alpha[index])).toEqual([0, 0, 0, 0]);
    }
  });

  it("keeps the torso inside the documented target box without weak halo pixels", async () => {
    const { alpha, width, height } = await alphaChannel(
      asset("garments", "ao_dai", "red", "torso.png"),
    );
    let visible = 0;
    let weak = 0;
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const value = alpha[y * width + x];
        if (value === 0) continue;
        visible += 1;
        if (value < 12) weak += 1;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }

    expect(visible).toBeGreaterThan(100_000);
    expect(weak).toBe(0);
    expect(minX).toBeGreaterThanOrEqual(307);
    expect(minX).toBeLessThanOrEqual(311);
    expect(maxX).toBeGreaterThanOrEqual(712);
    expect(maxX).toBeLessThanOrEqual(716);
    expect(minY).toBe(395);
    expect(maxY).toBe(1410);
  });

  it("records required garment manifest fields, files and pending cultural review", async () => {
    for (const [manifestPath, variantId] of [
      [redManifestPath, "red"],
      [indigoManifestPath, "indigo"],
    ] as const) {
      const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
      expect(manifest).toMatchObject({
        schemaVersion: 1,
        garmentId: "ao_dai",
        variantId,
        version: "v001",
        canvas: { width: 1024, height: 1536 },
        normalizationBox: { left: 300, top: 395, right: 724, bottom: 1410 },
        layerNormalization: {
          pants: {
            box: { left: 350, top: 720, right: 674, bottom: 1370 },
            visibleBounds: { left: 389, top: 720, right: 635, bottom: 1370 },
          },
          torso: {
            box: { left: 300, top: 395, right: 724, bottom: 1410 },
            visibleBounds: { left: 309, top: 395, right: 714, bottom: 1410 },
          },
          necklace: {
            box: { left: 455, top: 400, right: 569, bottom: 475 },
            visibleBounds: { left: 455, top: 411, right: 569, bottom: 464 },
          },
          headpiece: {
            box: { left: 405, top: 150, right: 619, bottom: 245 },
            visibleBounds: { left: 432, top: 150, right: 591, bottom: 245 },
          },
        },
        review: { technical: "pending", cultural: "pending" },
      });
      expect(manifest.provenance).toEqual(
        expect.objectContaining({
          sourceTool: "built-in image_gen",
          processingPipeline: "scripts/pipeline/process-approved-assets.mjs",
        }),
      );
      expect(manifest.layers).toEqual([
        expect.objectContaining({
          layerId: "pants",
          renderOrder: 25,
          required: true,
          width: 1024,
          height: 1536,
        }),
        expect.objectContaining({
          layerId: "torso",
          renderOrder: 40,
          required: true,
          width: 1024,
          height: 1536,
        }),
        expect.objectContaining({
          layerId: "necklace",
          renderOrder: 50,
          required: false,
          width: 1024,
          height: 1536,
        }),
        expect.objectContaining({
          layerId: "headpiece",
          renderOrder: 60,
          required: false,
          width: 1024,
          height: 1536,
        }),
      ]);

      for (const layer of manifest.layers) {
        expect(layer.assetPath).toMatch(/^\/assets\//);
        const filePath = publicAssetPath(layer.assetPath);
        await access(filePath);
        const { alpha, width, height } = await alphaChannel(filePath);
        expect([width, height]).toEqual([1024, 1536]);
        const corners = [0, width - 1, (height - 1) * width, width * height - 1];
        expect(corners.map((index) => alpha[index])).toEqual([0, 0, 0, 0]);
      }
    }
  });
});
