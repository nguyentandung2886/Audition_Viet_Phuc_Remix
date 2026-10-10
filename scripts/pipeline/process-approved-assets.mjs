import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const publicRoot = path.join(root, "public");
const approvedRoot = path.join(publicRoot, "assets", "approved");
const sceneRoot = path.join(approvedRoot, "scenes", "ao_dai");
const garmentRoot = path.join(approvedRoot, "garments", "ao_dai");

const source = {
  torso: path.join(
    root,
    "scripts",
    "pipeline",
    "temp_processing",
    "ao-dai",
    "torso-red-white-v001.png",
  ),
  pants: path.join(
    root,
    "scripts",
    "pipeline",
    "temp_processing",
    "ao-dai",
    "pants-white-v001.png",
  ),
  necklace: path.join(
    root,
    "scripts",
    "pipeline",
    "temp_processing",
    "ao-dai",
    "necklace-white-v001.png",
  ),
  headpiece: path.join(
    root,
    "scripts",
    "pipeline",
    "temp_processing",
    "ao-dai",
    "headpiece-red-white-v001.png",
  ),
  background: path.join(
    root,
    "scripts",
    "pipeline",
    "temp_processing",
    "ao-dai",
    "room-background-v001.png",
  ),
  foreground: path.join(
    root,
    "scripts",
    "pipeline",
    "temp_processing",
    "ao-dai",
    "room-foreground-v001.png",
  ),
};

const CANVAS = {
  scene: { width: 1600, height: 1000 },
  garment: { width: 1024, height: 1536 },
};
const TORSO_CANONICAL_BOX = { left: 300, top: 395, right: 724, bottom: 1410 };
const LAYER_BOXES = {
  pants: { left: 350, top: 720, right: 674, bottom: 1370 },
  torso: TORSO_CANONICAL_BOX,
  necklace: { left: 455, top: 400, right: 569, bottom: 475 },
  headpiece: { left: 405, top: 150, right: 619, bottom: 245 },
};

const toPublicPath = (absolutePath) =>
  `/${path.relative(publicRoot, absolutePath).replaceAll("\\", "/")}`;

async function checksum(filePath) {
  return createHash("sha256").update(await readFile(filePath)).digest("hex");
}

async function extractWhiteBackground(inputPath) {
  const { data, info } = await sharp(inputPath)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const pixelCount = info.width * info.height;
  const background = new Uint8Array(pixelCount);
  const queue = new Int32Array(pixelCount);
  let head = 0;
  let tail = 0;
  const isBackdrop = (pixel) => {
    const index = pixel * info.channels;
    return Math.hypot(
      255 - data[index],
      255 - data[index + 1],
      255 - data[index + 2],
    ) <= 48;
  };
  const enqueueBackdrop = (pixel) => {
    if (background[pixel] || !isBackdrop(pixel)) return;
    background[pixel] = 1;
    queue[tail] = pixel;
    tail += 1;
  };

  for (let x = 0; x < info.width; x += 1) {
    enqueueBackdrop(x);
    enqueueBackdrop((info.height - 1) * info.width + x);
  }
  for (let y = 0; y < info.height; y += 1) {
    enqueueBackdrop(y * info.width);
    enqueueBackdrop(y * info.width + info.width - 1);
  }
  while (head < tail) {
    const pixel = queue[head];
    head += 1;
    const x = pixel % info.width;
    const y = Math.floor(pixel / info.width);
    if (x > 0) enqueueBackdrop(pixel - 1);
    if (x + 1 < info.width) enqueueBackdrop(pixel + 1);
    if (y > 0) enqueueBackdrop(pixel - info.width);
    if (y + 1 < info.height) enqueueBackdrop(pixel + info.width);
  }

  // Keep the largest connected non-backdrop component. This retains white
  // fabric enclosed by its ink outline while excluding detached floor shadow.
  const labels = new Int32Array(pixelCount);
  let largestLabel = 0;
  let largestSize = 0;
  let nextLabel = 0;
  for (let start = 0; start < pixelCount; start += 1) {
    if (background[start] || labels[start]) continue;
    nextLabel += 1;
    head = 0;
    tail = 1;
    queue[0] = start;
    labels[start] = nextLabel;
    while (head < tail) {
      const pixel = queue[head];
      head += 1;
      const x = pixel % info.width;
      const y = Math.floor(pixel / info.width);
      for (const neighbor of [
        x > 0 ? pixel - 1 : -1,
        x + 1 < info.width ? pixel + 1 : -1,
        y > 0 ? pixel - info.width : -1,
        y + 1 < info.height ? pixel + info.width : -1,
      ]) {
        if (neighbor < 0 || background[neighbor] || labels[neighbor]) continue;
        labels[neighbor] = nextLabel;
        queue[tail] = neighbor;
        tail += 1;
      }
    }
    if (tail > largestSize) {
      largestSize = tail;
      largestLabel = nextLabel;
    }
  }

  const output = Buffer.alloc(pixelCount * 4);
  for (let pixel = 0; pixel < pixelCount; pixel += 1) {
    if (labels[pixel] !== largestLabel) continue;
    const sourceIndex = pixel * info.channels;
    const targetIndex = pixel * 4;
    output[targetIndex] = data[sourceIndex];
    output[targetIndex + 1] = data[sourceIndex + 1];
    output[targetIndex + 2] = data[sourceIndex + 2];
    output[targetIndex + 3] = 255;
  }

  return { data: output, width: info.width, height: info.height };
}

function visibleBounds(pixels, width, height) {
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (pixels[(y * width + x) * 4 + 3] === 0) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }
  if (right < 0) throw new Error("Extracted asset has no visible pixels.");
  return { left, top, right, bottom };
}

async function normalizeToBox(extracted, box) {
  const bounds = visibleBounds(extracted.data, extracted.width, extracted.height);
  const sourceWidth = bounds.right - bounds.left + 1;
  const sourceHeight = bounds.bottom - bounds.top + 1;
  const boxWidth = box.right - box.left + 1;
  const boxHeight = box.bottom - box.top + 1;
  const scale = Math.min(boxWidth / sourceWidth, boxHeight / sourceHeight);
  const outputWidth = Math.round(sourceWidth * scale);
  const outputHeight = Math.round(sourceHeight * scale);
  const left = box.left + Math.floor((boxWidth - outputWidth) / 2);
  const top = box.top + Math.floor((boxHeight - outputHeight) / 2);
  const cropped = await sharp(extracted.data, {
    raw: { width: extracted.width, height: extracted.height, channels: 4 },
  })
    .extract({
      left: bounds.left,
      top: bounds.top,
      width: sourceWidth,
      height: sourceHeight,
    })
    .resize(outputWidth, outputHeight, { fit: "fill", kernel: sharp.kernel.nearest })
    .png()
    .toBuffer();
  const { data } = await sharp({
    create: {
      width: CANVAS.garment.width,
      height: CANVAS.garment.height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: cropped, left, top }])
    .raw()
    .toBuffer({ resolveWithObject: true });
  return {
    data,
    width: CANVAS.garment.width,
    height: CANVAS.garment.height,
    bounds: { left, top, right: left + outputWidth - 1, bottom: top + outputHeight - 1 },
  };
}

function recolorGarment(input, target) {
  const output = Buffer.from(input);
  const targetLuma = target.r * 0.2126 + target.g * 0.7152 + target.b * 0.0722;

  for (let index = 0; index < output.length; index += 4) {
    if (output[index + 3] === 0) continue;
    const red = output[index];
    const green = output[index + 1];
    const blue = output[index + 2];

    // Preserve dark outlines and gold piping; recolor only red fabric pixels.
    if (red < 45 || red < green * 1.3 || red < blue * 1.18) continue;
    const luma = red * 0.2126 + green * 0.7152 + blue * 0.0722;
    const shade = Math.max(0.38, Math.min(1.55, luma / targetLuma));
    output[index] = Math.min(255, Math.round(target.r * shade));
    output[index + 1] = Math.min(255, Math.round(target.g * shade));
    output[index + 2] = Math.min(255, Math.round(target.b * shade));
  }

  return output;
}

async function writeGarmentVariants() {
  const layerSpecs = [
    {
      layerId: "pants",
      sourcePath: source.pants,
      sourceVersion: "pants-white-v001",
      renderOrder: 25,
      required: true,
      box: LAYER_BOXES.pants,
      recolor: false,
    },
    {
      layerId: "torso",
      sourcePath: source.torso,
      sourceVersion: "torso-red-white-v001",
      renderOrder: 40,
      required: true,
      box: LAYER_BOXES.torso,
      recolor: true,
    },
    {
      layerId: "necklace",
      sourcePath: source.necklace,
      sourceVersion: "necklace-white-v001",
      renderOrder: 50,
      required: false,
      box: LAYER_BOXES.necklace,
      recolor: false,
    },
    {
      layerId: "headpiece",
      sourcePath: source.headpiece,
      sourceVersion: "headpiece-red-white-v001",
      renderOrder: 60,
      required: false,
      box: LAYER_BOXES.headpiece,
      recolor: true,
    },
  ];
  const normalizedLayers = new Map();
  for (const spec of layerSpecs) {
    const extracted = await extractWhiteBackground(spec.sourcePath);
    if (
      extracted.width !== CANVAS.garment.width ||
      extracted.height !== CANVAS.garment.height
    ) {
      throw new Error(`${spec.sourceVersion} must be 1024x1536 before extraction.`);
    }
    normalizedLayers.set(spec.layerId, await normalizeToBox(extracted, spec.box));
  }
  const variants = [
    { id: "red", label: "Đỏ son", color: { r: 141, g: 61, b: 80 } },
    { id: "indigo", label: "Lam chàm", color: { r: 53, g: 77, b: 128 } },
  ];

  for (const variant of variants) {
    const directory = path.join(garmentRoot, variant.id);
    await mkdir(directory, { recursive: true });
    const layers = [];
    for (const spec of layerSpecs) {
      const normalized = normalizedLayers.get(spec.layerId);
      const outputPath = path.join(directory, `${spec.layerId}.png`);
      const pixels = spec.recolor
        ? recolorGarment(normalized.data, variant.color)
        : normalized.data;
      await sharp(pixels, {
        raw: { width: normalized.width, height: normalized.height, channels: 4 },
      })
        .png({ compressionLevel: 9, adaptiveFiltering: false, palette: false })
        .toFile(outputPath);
      layers.push({
        layerId: spec.layerId,
        assetPath: toPublicPath(outputPath),
        renderOrder: spec.renderOrder,
        required: spec.required,
        width: CANVAS.garment.width,
        height: CANVAS.garment.height,
        sourceVersion: spec.sourceVersion,
        checksumSha256: await checksum(outputPath),
      });
    }

    const manifest = {
      schemaVersion: 1,
      garmentId: "ao_dai",
      variantId: variant.id,
      label: variant.label,
      version: "v001",
      canvas: CANVAS.garment,
      normalizationBox: TORSO_CANONICAL_BOX,
      visibleBounds: normalizedLayers.get("torso").bounds,
      layerNormalization: Object.fromEntries(
        layerSpecs.map((spec) => [
          spec.layerId,
          { box: spec.box, visibleBounds: normalizedLayers.get(spec.layerId).bounds },
        ]),
      ),
      layers,
      provenance: {
        sourceTool: "built-in image_gen",
        sources: layerSpecs.map((spec) => ({
          layerId: spec.layerId,
          sourceVersion: spec.sourceVersion,
          sourcePath: `scripts/pipeline/temp_processing/ao-dai/${path.basename(spec.sourcePath)}`,
        })),
        processingPipeline: "scripts/pipeline/process-approved-assets.mjs",
        colorMethod: "shared alpha masks; deterministic masked recolor for torso and headpiece",
      },
      review: {
        status: "draft",
        technical: "pending",
        visual: "pending",
        cultural: "pending",
      },
    };
    await writeFile(
      path.join(directory, "garment.json"),
      `${JSON.stringify(manifest, null, 2)}\n`,
      "utf8",
    );
  }
}

async function clearAlphaCorners(inputPath, outputPath) {
  const { data, info } = await sharp(inputPath)
    .resize(CANVAS.scene.width, CANVAS.scene.height, { fit: "fill" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const radius = 3;
  for (const originY of [0, info.height - radius]) {
    for (const originX of [0, info.width - radius]) {
      for (let y = originY; y < originY + radius; y += 1) {
        for (let x = originX; x < originX + radius; x += 1) {
          data[(y * info.width + x) * 4 + 3] = 0;
        }
      }
    }
  }
  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png({ compressionLevel: 9, adaptiveFiltering: false, palette: false })
    .toFile(outputPath);
}

async function writeScene() {
  const backgroundPath = path.join(sceneRoot, "background.png");
  const foregroundPath = path.join(sceneRoot, "foreground.png");
  await mkdir(sceneRoot, { recursive: true });
  await sharp(source.background)
    .resize(CANVAS.scene.width, CANVAS.scene.height, { fit: "fill" })
    .removeAlpha()
    .png({ compressionLevel: 9, adaptiveFiltering: false, palette: false })
    .toFile(backgroundPath);
  await clearAlphaCorners(source.foreground, foregroundPath);

  const layers = [
    { layerId: "background", filePath: backgroundPath, renderOrder: 0 },
    { layerId: "foreground", filePath: foregroundPath, renderOrder: 30 },
  ];
  const manifest = {
    schemaVersion: 1,
    sceneId: "ao_dai",
    version: "v001",
    canvas: CANVAS.scene,
    desktopCrop: { x: 0, y: 0, width: 1600, height: 1000 },
    mobileCrop: { x: 400, y: 0, width: 800, height: 1000 },
    characterBounds: { x: 584, y: 200, width: 432, height: 648 },
    layers: await Promise.all(
      layers.map(async (layer) => ({
        layerId: layer.layerId,
        assetPath: toPublicPath(layer.filePath),
        renderOrder: layer.renderOrder,
        width: CANVAS.scene.width,
        height: CANVAS.scene.height,
        checksumSha256: await checksum(layer.filePath),
      })),
    ),
    provenance: {
      sourceTool: "built-in image_gen",
      sourceVersion: "room-background-v001 + room-foreground-v001",
      sourcePaths: [
        "scripts/pipeline/temp_processing/ao-dai/room-background-v001.png",
        "scripts/pipeline/temp_processing/ao-dai/room-foreground-v001.png",
      ],
      processingPipeline: "scripts/pipeline/process-approved-assets.mjs",
    },
    review: {
      status: "draft",
      technical: "pending",
      visual: "accepted-source-pending-derivative-review",
      cultural: "pending",
    },
  };
  await writeFile(
    path.join(sceneRoot, "scene.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
}

await writeGarmentVariants();
await writeScene();
console.log("Approved asset derivatives generated deterministically.");
