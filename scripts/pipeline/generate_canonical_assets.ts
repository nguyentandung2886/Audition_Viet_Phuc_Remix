import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import {
  CANONICAL_CANVAS,
  CANONICAL_BASE_CHARACTER_METADATA,
  MODULAR_AO_DAI_METADATA,
  validateCanonicalAsset,
  composeCanonicalOutfit,
} from '../../src/utils/canonicalPipeline.ts';

async function generateAssets() {
  const projectRoot = process.cwd();
  const canonicalDir = path.join(projectRoot, 'public', 'assets', 'canonical');
  const sourceAssetsDir = path.join(projectRoot, 'public', 'assets');

  fs.mkdirSync(canonicalDir, { recursive: true });

  console.log('--- Generating Canonical 1024x1536 Assets ---');

  // 1. Base Character (1024x1536)
  const mannequinSource = path.join(sourceAssetsDir, 'anime_base_mannequin_1791435430131-removebg-preview.png');
  const baseOutputPath = path.join(canonicalDir, 'base_character.png');
  
  // Scale mannequin: 432x578 -> 1024x1370, placed at (0, 83) on 1024x1536
  const scaledMannequin = await sharp(mannequinSource)
    .resize(1024, 1370, { fit: 'fill' })
    .toBuffer();

  await sharp({
    create: {
      width: CANONICAL_CANVAS.width,
      height: CANONICAL_CANVAS.height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: scaledMannequin,
        left: 0,
        top: 83,
      },
    ])
    .png()
    .toFile(baseOutputPath);
  console.log('✓ Generated base_character.png');

  // 2. Ao Dai Pants (1024x1536)
  const pantsSource = path.join(sourceAssetsDir, 'quan_trang_ngu_than_clean.png');
  const pantsOutputPath = path.join(canonicalDir, 'ao_dai_pants.png');

  const scaledPants = await sharp(pantsSource)
    .resize(1024, 1370, { fit: 'fill' })
    .toBuffer();

  await sharp({
    create: {
      width: CANONICAL_CANVAS.width,
      height: CANONICAL_CANVAS.height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: scaledPants,
        left: 0,
        top: 83,
      },
    ])
    .png()
    .toFile(pantsOutputPath);
  console.log('✓ Generated ao_dai_pants.png');

  // 3. Ao Dai Rear Panel (Tà sau - 1024x1536, zIndex: 20)
  // Flows behind the character from waist (y=680) down past ankles (y=1420)
  const rearPanelSvg = `
  <svg width="1024" height="1536" viewBox="0 0 1024 1536" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="rearGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#8B1E1E"/>
        <stop offset="40%" stop-color="#A62B2B"/>
        <stop offset="100%" stop-color="#6E1515"/>
      </linearGradient>
      <linearGradient id="rearGold" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#C69214"/>
        <stop offset="50%" stop-color="#F2C94C"/>
        <stop offset="100%" stop-color="#C69214"/>
      </linearGradient>
    </defs>
    <!-- Rear skirt silhouette -->
    <path d="M 440 680
             Q 380 900 340 1200
             Q 320 1350 310 1420
             L 714 1420
             Q 704 1350 684 1200
             Q 644 900 584 680
             Z"
          fill="url(#rearGrad)" opacity="0.95"/>
    <!-- Fold shadows -->
    <path d="M 470 700 Q 430 1000 400 1420 L 430 1420 Q 460 1000 490 700 Z" fill="#580F0F" opacity="0.4"/>
    <path d="M 554 700 Q 594 1000 624 1420 L 594 1420 Q 564 1000 534 700 Z" fill="#580F0F" opacity="0.4"/>
    <!-- Hem golden embroidery border -->
    <path d="M 310 1410 L 714 1410 L 714 1420 L 310 1420 Z" fill="url(#rearGold)" opacity="0.85"/>
  </svg>
  `;
  const rearOutputPath = path.join(canonicalDir, 'ao_dai_rear_panel.png');
  await sharp(Buffer.from(rearPanelSvg)).png().toFile(rearOutputPath);
  console.log('✓ Generated ao_dai_rear_panel.png');

  // 4. Ao Dai Front Panel (Tà trước & Thân áo - 1024x1536, zIndex: 40)
  // High neck bodice curving down shoulders, fitted waist, flowing front panel
  const frontPanelSvg = `
  <svg width="1024" height="1536" viewBox="0 0 1024 1536" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="silkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#B83232"/>
        <stop offset="35%" stop-color="#A62B2B"/>
        <stop offset="70%" stop-color="#8F2121"/>
        <stop offset="100%" stop-color="#731414"/>
      </linearGradient>
      <linearGradient id="goldEmbroidery" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#F2C94C"/>
        <stop offset="50%" stop-color="#E0A926"/>
        <stop offset="100%" stop-color="#B37D0E"/>
      </linearGradient>
      <filter id="silkSheen" x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
    </defs>

    <!-- Torso and Sleeves -->
    <!-- Left sleeve (viewer's left) -->
    <path d="M 440 375 L 360 440 L 320 540 L 310 650 L 345 660 L 365 560 L 425 480 Z" fill="url(#silkGrad)"/>
    <!-- Right sleeve (viewer's right) -->
    <path d="M 584 375 L 664 440 L 704 540 L 714 650 L 679 660 L 659 560 L 599 480 Z" fill="url(#silkGrad)"/>

    <!-- Bodice & Fitted Torso -->
    <path d="M 470 375
             Q 450 440 435 520
             Q 430 600 440 680
             Q 400 950 365 1250
             Q 350 1360 345 1405
             L 679 1405
             Q 674 1360 659 1250
             Q 624 950 584 680
             Q 594 600 589 520
             Q 574 440 554 375
             Z"
          fill="url(#silkGrad)" filter="url(#silkSheen)"/>

    <!-- Traditional diagonal overlap seam (vạt chéo sang nách phải) -->
    <path d="M 512 375 Q 545 420 580 470" stroke="#C69214" stroke-width="3" fill="none" opacity="0.8"/>
    <!-- Traditional frog buttons (khuy ngọc) on right chest -->
    <circle cx="530" cy="405" r="4" fill="#F9F6F0" stroke="#C69214" stroke-width="1.5"/>
    <circle cx="555" cy="438" r="4" fill="#F9F6F0" stroke="#C69214" stroke-width="1.5"/>
    <circle cx="575" cy="470" r="4" fill="#F9F6F0" stroke="#C69214" stroke-width="1.5"/>

    <!-- Golden Lotus & Cloud Chest Embroidery (Họa tiết hoa sen & mây ngũ sắc) -->
    <g transform="translate(512, 530) scale(0.85)">
      <!-- Central Lotus Petals -->
      <path d="M 0 -35 C 15 -15 25 10 0 25 C -25 10 -15 -15 0 -35 Z" fill="url(#goldEmbroidery)"/>
      <path d="M 0 25 C 20 15 35 -5 28 -25 C 20 -10 10 10 0 25 Z" fill="url(#goldEmbroidery)" opacity="0.9"/>
      <path d="M 0 25 C -20 15 -35 -5 -28 -25 C -20 -10 -10 10 0 25 Z" fill="url(#goldEmbroidery)" opacity="0.9"/>
      <path d="M 0 25 C 30 20 48 5 42 -12 C 30 5 15 15 0 25 Z" fill="url(#goldEmbroidery)" opacity="0.75"/>
      <path d="M 0 25 C -30 20 -48 5 -42 -12 C -30 5 -15 15 0 25 Z" fill="url(#goldEmbroidery)" opacity="0.75"/>
      <!-- Decorative floral scrolls -->
      <path d="M -60 30 Q -25 40 0 25 Q 25 40 60 30 Q 30 50 0 45 Q -30 50 -60 30 Z" fill="url(#goldEmbroidery)" opacity="0.85"/>
      <path d="M -80 40 Q -50 30 -30 45" stroke="#F2C94C" stroke-width="2" fill="none" opacity="0.7"/>
      <path d="M 80 40 Q 50 30 30 45" stroke="#F2C94C" stroke-width="2" fill="none" opacity="0.7"/>
    </g>

    <!-- Subtle front fabric crease & highlight -->
    <path d="M 500 700 Q 490 1050 480 1400" stroke="#B83232" stroke-width="6" fill="none" opacity="0.4"/>
    <path d="M 524 700 Q 534 1050 544 1400" stroke="#731414" stroke-width="6" fill="none" opacity="0.3"/>

    <!-- Bottom Hem Golden Border with stylized waves (Thủy ba) -->
    <path d="M 345 1395 L 679 1395 L 679 1405 L 345 1405 Z" fill="url(#goldEmbroidery)"/>
  </svg>
  `;
  const frontOutputPath = path.join(canonicalDir, 'ao_dai_front_panel.png');
  await sharp(Buffer.from(frontPanelSvg)).png().toFile(frontOutputPath);
  console.log('✓ Generated ao_dai_front_panel.png');

  // 5. Ao Dai Collar (Cổ lập lĩnh - 1024x1536, zIndex: 45)
  // Mandarin standing collar encircling the neck anchor (y=360)
  const collarSvg = `
  <svg width="1024" height="1536" viewBox="0 0 1024 1536" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="collarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#C43B3B"/>
        <stop offset="50%" stop-color="#A62B2B"/>
        <stop offset="100%" stop-color="#7A1818"/>
      </linearGradient>
      <linearGradient id="collarGold" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#C69214"/>
        <stop offset="50%" stop-color="#F2C94C"/>
        <stop offset="100%" stop-color="#C69214"/>
      </linearGradient>
    </defs>
    <!-- Standing collar band around neck (y=335 to y=375) -->
    <path d="M 475 375
             C 472 355 480 338 502 334
             L 522 334
             C 544 338 552 355 549 375
             C 535 380 489 380 475 375 Z"
          fill="url(#collarGrad)"/>
    <!-- Golden collar rim -->
    <path d="M 477 338 C 495 332 529 332 547 338" stroke="url(#collarGold)" stroke-width="3" fill="none"/>
    <!-- Collar center closure notch -->
    <line x1="512" y1="334" x2="512" y2="376" stroke="#580F0F" stroke-width="1.5"/>
    <circle cx="512" cy="355" r="3" fill="#F9F6F0" stroke="#C69214" stroke-width="1.2"/>
  </svg>
  `;
  const collarOutputPath = path.join(canonicalDir, 'ao_dai_collar.png');
  await sharp(Buffer.from(collarSvg)).png().toFile(collarOutputPath);
  console.log('✓ Generated ao_dai_collar.png');

  // 6. Ao Dai Accessory (Khăn đóng truyền thống - 1024x1536, zIndex: 60)
  // Traditional Vietnamese layered fabric headwrap encircling head anchor (y=220)
  const accessorySvg = `
  <svg width="1024" height="1536" viewBox="0 0 1024 1536" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="khanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#2D3130"/>
        <stop offset="50%" stop-color="#1C1F1E"/>
        <stop offset="100%" stop-color="#101211"/>
      </linearGradient>
      <linearGradient id="khanGold" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#C69214"/>
        <stop offset="50%" stop-color="#F2C94C"/>
        <stop offset="100%" stop-color="#C69214"/>
      </linearGradient>
    </defs>
    <!-- Khăn đóng crown rings wrapped around upper head -->
    <!-- Outermost back arc -->
    <ellipse cx="512" cy="180" rx="90" ry="32" fill="#141716"/>
    <!-- Layered pleats (nếp khăn vấn) -->
    <path d="M 424 190 C 430 160 594 160 600 190 C 585 208 439 208 424 190 Z" fill="url(#khanGrad)"/>
    <path d="M 428 198 C 438 175 586 175 596 198 C 582 215 442 215 428 198 Z" fill="#252928"/>
    <path d="M 432 208 C 445 188 579 188 592 208 C 580 224 444 224 432 208 Z" fill="url(#khanGrad)"/>
    <path d="M 436 218 C 450 200 574 200 588 218 C 576 232 448 232 436 218 Z" fill="#1C1F1E"/>
    <!-- Subtle golden hairline brocade trim -->
    <path d="M 434 206 C 455 190 569 190 590 206" stroke="url(#khanGold)" stroke-width="1.8" fill="none" opacity="0.75"/>
    <path d="M 438 217 C 458 202 566 202 586 217" stroke="url(#khanGold)" stroke-width="1.5" fill="none" opacity="0.6"/>
  </svg>
  `;
  const accessoryOutputPath = path.join(canonicalDir, 'ao_dai_accessory.png');
  await sharp(Buffer.from(accessorySvg)).png().toFile(accessoryOutputPath);
  console.log('✓ Generated ao_dai_accessory.png');

  // 7. Write metadata JSON files
  const charMetaPath = path.join(canonicalDir, 'character.json');
  fs.writeFileSync(charMetaPath, JSON.stringify(CANONICAL_BASE_CHARACTER_METADATA, null, 2));
  console.log('✓ Wrote character.json');

  const garmentMetaPath = path.join(canonicalDir, 'garment_ao_dai.json');
  fs.writeFileSync(garmentMetaPath, JSON.stringify(MODULAR_AO_DAI_METADATA, null, 2));
  console.log('✓ Wrote garment_ao_dai.json');

  // 8. Validate all canonical assets and collect report
  console.log('\n--- Validating Canonical Assets ---');
  const allAssetsToValidate = [
    { id: CANONICAL_BASE_CHARACTER_METADATA.characterId, path: baseOutputPath },
    ...MODULAR_AO_DAI_METADATA.components.map((c) => ({
      id: c.assetId,
      path: path.join(projectRoot, 'public', c.filePath),
    })),
  ];

  const validationReports = [];
  for (const asset of allAssetsToValidate) {
    const report = await validateCanonicalAsset(asset.path, 1024, 1536, asset.id);
    console.log(
      `  [${report.status.toUpperCase()}] ${report.assetId}: ` +
        `dimensionsMatch=${report.dimensionsMatch}, hasAlpha=${report.hasAlpha}, emptyImage=${report.emptyImage}`
    );
    validationReports.push(report);
  }

  const reportOutputPath = path.join(canonicalDir, 'validation_report.json');
  fs.writeFileSync(reportOutputPath, JSON.stringify(validationReports, null, 2));
  console.log(`✓ Wrote validation_report.json with ${validationReports.length} reports.`);

  // 9. Composite the full outfit preview
  console.log('\n--- Compositing Full Modular Ao Dai Preview ---');
  const layersForComposite = [
    { filePath: baseOutputPath, renderOrder: 30, assetId: 'base' },
    ...MODULAR_AO_DAI_METADATA.components.map((c) => ({
      filePath: path.join(projectRoot, 'public', c.filePath),
      renderOrder: c.renderOrder,
      assetId: c.assetId,
    })),
  ];

  const previewOutputPath = path.join(canonicalDir, 'preview_ao_dai.png');
  await composeCanonicalOutfit(layersForComposite, previewOutputPath);
  console.log(`✓ Created composite preview at ${previewOutputPath}`);

  // Validate composite output
  const compositeReport = await validateCanonicalAsset(previewOutputPath, 1024, 1536, 'preview_ao_dai');
  console.log(
    `✓ Composite Preview Validation: isValid=${compositeReport.isValid}, status=${compositeReport.status}, ` +
      `pixels=${compositeReport.nonEmptyPixelCount}`
  );

  console.log('\nAll canonical assets generated and validated successfully!');
}

generateAssets().catch((err) => {
  console.error('Fatal error generating canonical assets:', err);
  process.exit(1);
});
