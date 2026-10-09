const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function removeWhiteBackground(inputPath, outputPath, options = {}) {
  const threshold = options.threshold ?? 232;
  const maxVariance = options.maxVariance ?? 28;

  const image = sharp(inputPath);
  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const visited = new Uint8Array(width * height);
  const queue = [];

  const isBackgroundPixel = (x, y) => {
    const idx = (y * width + x) * channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    const brightness = (r + g + b) / 3;
    const variance = Math.max(r, g, b) - Math.min(r, g, b);

    return brightness >= threshold && variance <= maxVariance;
  };

  // Seed BFS with outer borders
  for (let x = 0; x < width; x++) {
    if (isBackgroundPixel(x, 0)) {
      queue.push(x, 0);
      visited[0 * width + x] = 1;
    }
    if (isBackgroundPixel(x, height - 1)) {
      queue.push(x, height - 1);
      visited[(height - 1) * width + x] = 1;
    }
  }

  for (let y = 0; y < height; y++) {
    if (!visited[y * width + 0] && isBackgroundPixel(0, y)) {
      queue.push(0, y);
      visited[y * width + 0] = 1;
    }
    if (!visited[y * width + (width - 1)] && isBackgroundPixel(width - 1, y)) {
      queue.push(width - 1, y);
      visited[y * width + (width - 1)] = 1;
    }
  }

  let head = 0;
  while (head < queue.length) {
    const cx = queue[head++];
    const cy = queue[head++];

    const pIdx = (cy * width + cx) * channels;
    data[pIdx + 3] = 0;

    const neighbors = [
      [cx + 1, cy],
      [cx - 1, cy],
      [cx, cy + 1],
      [cx, cy - 1]
    ];

    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nIndex = ny * width + nx;
        if (!visited[nIndex]) {
          visited[nIndex] = 1;
          if (isBackgroundPixel(nx, ny)) {
            queue.push(nx, ny);
          }
        }
      }
    }
  }

  // Defringe pass
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const pIdx = (y * width + x) * channels;
      const alpha = data[pIdx + 3];

      if (alpha > 0) {
        const hasTransparentNeighbor =
          data[((y - 1) * width + x) * channels + 3] === 0 ||
          data[((y + 1) * width + x) * channels + 3] === 0 ||
          data[(y * width + (x - 1)) * channels + 3] === 0 ||
          data[(y * width + (x + 1)) * channels + 3] === 0;

        if (hasTransparentNeighbor) {
          const r = data[pIdx];
          const g = data[pIdx + 1];
          const b = data[pIdx + 2];
          const brightness = (r + g + b) / 3;

          if (brightness > 215) {
            const factor = Math.max(0, Math.min(1, (245 - brightness) / 30));
            data[pIdx + 3] = Math.round(alpha * factor);
          }
        }
      }
    }
  }

  await sharp(data, {
    raw: { width, height, channels }
  }).png().toFile(outputPath);

  console.log(`Saved transparent PNG: ${outputPath}`);
}

module.exports = { removeWhiteBackground };

if (require.main === module) {
  const [,, inputFile, outputFile] = process.argv;
  if (!inputFile || !outputFile) {
    console.error('Usage: node scripts/remove-bg.js <input-image> <output-png>');
    process.exit(1);
  }
  removeWhiteBackground(inputFile, outputFile).catch(err => {
    console.error('Error removing background:', err);
    process.exit(1);
  });
}
