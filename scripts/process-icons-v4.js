/**
 * 아사나 아이콘 처리 스크립트 v4
 * - 먼저 작은 크기로 리사이즈하여 속도 개선
 * - Flood Fill 배경 제거
 * - 콘텐츠가 85%를 차지하도록 스케일링
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const INPUT_DIR = path.join(__dirname, '../assets/images/new-asanapng');
const OUTPUT_DIR = path.join(__dirname, '../assets/images/asana-icons');
const WORK_SIZE = 600; // 작업 크기
const OUTPUT_SIZE = 512;
const CONTENT_FILL = 0.85;

const FILE_NAME_MAPPING = {
  'supta konasana': 'Supta Konasana',
  'Supta konasana': 'Supta Konasana',
  'Upavistha Konasana Ⅰ': 'Upavistha Konasana',
  'Salamba Sirsasana Pada Garudasana': 'Salamba Sirsasana',
};
const SKIP_FILES = ['Upavistha Konasana Ⅱ', 'Sirsasana Pada Hanumanasana'];

// 밝기 기반 배경 제거 (단순하고 안정적)
// 밝기가 threshold 이상인 픽셀을 투명하게
const BRIGHTNESS_THRESHOLD = 145;

function removeBackground(pixels, width, height) {
  const total = width * height;

  for (let i = 0; i < total; i++) {
    const offset = i * 4;
    // 밝기 계산 (YIQ 공식)
    const brightness = (pixels[offset] * 299 + pixels[offset + 1] * 587 + pixels[offset + 2] * 114) / 1000;

    if (brightness > BRIGHTNESS_THRESHOLD) {
      pixels[offset + 3] = 0; // 투명하게
    }
  }
}

async function processIcon(inputPath, outputPath) {
  try {
    // 1. 작은 크기로 리사이즈
    const resized = await sharp(inputPath)
      .resize(WORK_SIZE, WORK_SIZE, { fit: 'inside', withoutEnlargement: false })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const pixels = Buffer.from(resized.data);
    const { width, height } = resized.info;

    // 2. 밝기 기반 배경 제거 (brightness > 160인 픽셀 제거)
    removeBackground(pixels, width, height);

    // 3. 트림
    const noBgImage = sharp(pixels, { raw: { width, height, channels: 4 } });
    let trimmedBuffer, trimmedInfo;

    try {
      const result = await noBgImage
        .trim({ threshold: 10 })
        .png()
        .toBuffer({ resolveWithObject: true });
      trimmedBuffer = result.data;
      trimmedInfo = result.info;
    } catch (e) {
      const result = await noBgImage.png().toBuffer({ resolveWithObject: true });
      trimmedBuffer = result.data;
      trimmedInfo = { width, height };
    }

    // 4. 스케일링 (콘텐츠가 85% 차지)
    const contentMaxDim = Math.max(trimmedInfo.width, trimmedInfo.height);
    const targetSize = Math.round(OUTPUT_SIZE * CONTENT_FILL);
    const scale = targetSize / contentMaxDim;

    const newWidth = Math.round(trimmedInfo.width * scale);
    const newHeight = Math.round(trimmedInfo.height * scale);

    const resizedBuffer = await sharp(trimmedBuffer)
      .resize(newWidth, newHeight, { fit: 'inside' })
      .png()
      .toBuffer();

    // 5. 512x512 캔버스 중앙 배치
    await sharp({
      create: {
        width: OUTPUT_SIZE,
        height: OUTPUT_SIZE,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([{
      input: resizedBuffer,
      left: Math.floor((OUTPUT_SIZE - newWidth) / 2),
      top: Math.floor((OUTPUT_SIZE - newHeight) / 2)
    }])
    .png()
    .toFile(outputPath);

    return true;
  } catch (e) {
    console.error(`Error: ${path.basename(inputPath)} - ${e.message}`);
    return false;
  }
}

async function main() {
  const files = fs.readdirSync(INPUT_DIR).filter(f => f.toLowerCase().endsWith('.png'));
  console.log(`Processing ${files.length} icons (v4 - optimized)...\n`);

  let success = 0, skip = 0, fail = 0;

  for (const file of files) {
    const baseName = file.replace('.png', '');

    if (SKIP_FILES.includes(baseName)) {
      skip++;
      continue;
    }

    const outputName = FILE_NAME_MAPPING[baseName] || baseName;
    const result = await processIcon(
      path.join(INPUT_DIR, file),
      path.join(OUTPUT_DIR, outputName + '.png')
    );

    if (result) {
      process.stdout.write('.');
      success++;
    } else {
      process.stdout.write('x');
      fail++;
    }
  }

  console.log(`\n\nDone! Success: ${success}, Skipped: ${skip}, Failed: ${fail}`);
}

main().catch(console.error);
