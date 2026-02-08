/**
 * PNG 아이콘 배경 제거 스크립트
 * 흰색/베이지색 배경을 투명하게 변환
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const INPUT_DIR = path.join(__dirname, '../assets/images/new-asanapng');
const OUTPUT_DIR = path.join(__dirname, '../assets/images/asana-icons');

// 제거할 배경색들 (RGB)
const BACKGROUND_COLORS = [
  { r: 255, g: 255, b: 255 },       // 순수 흰색
  { r: 254, g: 254, b: 254 },       // 거의 흰색
  { r: 253, g: 253, b: 253 },
  { r: 252, g: 252, b: 252 },
  { r: 250, g: 250, b: 250 },       // 밝은 회색
  { r: 245, g: 245, b: 245 },
  { r: 255, g: 253, b: 245 },       // 베이지 계열
  { r: 255, g: 252, b: 240 },
  { r: 254, g: 250, b: 238 },
  { r: 253, g: 248, b: 235 },
  { r: 252, g: 246, b: 232 },
  { r: 250, g: 244, b: 230 },
  { r: 248, g: 242, b: 228 },
  { r: 245, g: 239, b: 225 },
  { r: 255, g: 248, b: 235 },       // 밝은 베이지
  { r: 255, g: 250, b: 240 },
  { r: 253, g: 245, b: 230 },       // 크림색
  { r: 250, g: 240, b: 220 },
];

// 색상 거리 계산 (유클리드)
function colorDistance(c1, c2) {
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
    Math.pow(c1.g - c2.g, 2) +
    Math.pow(c1.b - c2.b, 2)
  );
}

// 배경색인지 확인 (허용 오차 포함)
function isBackgroundColor(r, g, b, threshold = 25) {
  for (const bg of BACKGROUND_COLORS) {
    if (colorDistance({ r, g, b }, bg) < threshold) {
      return true;
    }
  }
  return false;
}

async function removeBackground(inputPath, outputPath) {
  try {
    // 이미지 메타데이터 및 raw 픽셀 데이터 가져오기
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    const { width, height, channels } = metadata;

    // raw 픽셀 데이터로 변환
    const rawBuffer = await image
      .ensureAlpha()
      .raw()
      .toBuffer();

    // 픽셀 데이터 수정 (배경색 → 투명)
    const pixelCount = width * height;
    for (let i = 0; i < pixelCount; i++) {
      const offset = i * 4; // RGBA
      const r = rawBuffer[offset];
      const g = rawBuffer[offset + 1];
      const b = rawBuffer[offset + 2];

      if (isBackgroundColor(r, g, b)) {
        rawBuffer[offset + 3] = 0; // 알파를 0으로 (투명)
      }
    }

    // 결과 저장
    await sharp(rawBuffer, {
      raw: {
        width,
        height,
        channels: 4,
      },
    })
      .png()
      .toFile(outputPath);

    return true;
  } catch (error) {
    console.error(`Error processing ${inputPath}:`, error.message);
    return false;
  }
}

async function main() {
  // 출력 디렉토리 생성
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // PNG 파일 목록
  const files = fs.readdirSync(INPUT_DIR)
    .filter(f => f.toLowerCase().endsWith('.png') && !f.startsWith('Gemini'));

  console.log(`Found ${files.length} PNG files to process...`);

  let successCount = 0;
  let failCount = 0;

  for (const file of files) {
    const inputPath = path.join(INPUT_DIR, file);
    const outputPath = path.join(OUTPUT_DIR, file);

    process.stdout.write(`Processing: ${file}... `);

    const success = await removeBackground(inputPath, outputPath);
    if (success) {
      console.log('✓');
      successCount++;
    } else {
      console.log('✗');
      failCount++;
    }
  }

  console.log(`\nDone! Success: ${successCount}, Failed: ${failCount}`);
  console.log(`Output directory: ${OUTPUT_DIR}`);
}

main().catch(console.error);
