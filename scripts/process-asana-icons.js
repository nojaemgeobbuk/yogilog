/**
 * 아사나 아이콘 처리 스크립트 v3
 * - 배경 제거 (flood fill)
 * - trim 후 패딩 추가하여 아이콘이 꽉 차게
 * - 파일명 정규화
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const INPUT_DIR = path.join(__dirname, '../assets/images/new-asanapng');
const OUTPUT_DIR = path.join(__dirname, '../assets/images/asana-icons');

// 파일명 매핑 (불일치 해결)
const FILE_NAME_MAPPING = {
  'supta konasana': 'Supta Konasana',
  'Upavistha Konasana Ⅰ': 'Upavistha Konasana',
  'Salamba Sirsasana Pada Garudasana': 'Salamba Sirsasana',
};

// 건너뛸 파일 (DB에 없는 변형)
const SKIP_FILES = [
  'Upavistha Konasana Ⅱ',
  'Sirsasana Pada Hanumanasana',
];

// 출력 크기
const OUTPUT_SIZE = 512;
const WORK_SIZE = 800; // 작업용 크기
const PADDING_PERCENT = 0.05; // 5% 패딩

// 색상 거리 계산
function colorDistance(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt(
    Math.pow(r1 - r2, 2) +
    Math.pow(g1 - g2, 2) +
    Math.pow(b1 - b2, 2)
  );
}

// 밝은 색인지 확인
function isLightColor(r, g, b) {
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 180;
}

async function removeBackground(inputBuffer, width, height) {
  const rawBuffer = Buffer.from(inputBuffer);
  const totalPixels = width * height;

  // 4개 모서리의 색상 샘플링
  const corners = [
    { x: 0, y: 0 },
    { x: width - 1, y: 0 },
    { x: 0, y: height - 1 },
    { x: width - 1, y: height - 1 },
  ];

  const cornerColors = corners.map(({ x, y }) => {
    const offset = (y * width + x) * 4;
    return {
      r: rawBuffer[offset],
      g: rawBuffer[offset + 1],
      b: rawBuffer[offset + 2],
    };
  });

  const lightCorners = cornerColors.filter(c => isLightColor(c.r, c.g, c.b));

  if (lightCorners.length === 0) {
    return rawBuffer;
  }

  // 평균 배경색 계산
  const bgColor = {
    r: Math.round(lightCorners.reduce((s, c) => s + c.r, 0) / lightCorners.length),
    g: Math.round(lightCorners.reduce((s, c) => s + c.g, 0) / lightCorners.length),
    b: Math.round(lightCorners.reduce((s, c) => s + c.b, 0) / lightCorners.length),
  };

  // Flood fill로 배경 영역 마킹
  const visited = new Uint8Array(totalPixels);
  const isBackground = new Uint8Array(totalPixels);
  const queue = [];

  // 가장자리에서 시작
  for (let x = 0; x < width; x++) {
    queue.push({ x, y: 0 });
    queue.push({ x, y: height - 1 });
  }
  for (let y = 0; y < height; y++) {
    queue.push({ x: 0, y });
    queue.push({ x: width - 1, y });
  }

  const threshold = 45;

  while (queue.length > 0) {
    const { x, y } = queue.shift();

    if (x < 0 || x >= width || y < 0 || y >= height) continue;

    const idx = y * width + x;
    if (visited[idx]) continue;
    visited[idx] = 1;

    const offset = idx * 4;
    const r = rawBuffer[offset];
    const g = rawBuffer[offset + 1];
    const b = rawBuffer[offset + 2];

    const distToBg = colorDistance(r, g, b, bgColor.r, bgColor.g, bgColor.b);
    const isBgLike = distToBg < threshold || (isLightColor(r, g, b) && distToBg < threshold * 1.5);

    if (isBgLike) {
      isBackground[idx] = 1;
      queue.push({ x: x - 1, y });
      queue.push({ x: x + 1, y });
      queue.push({ x, y: y - 1 });
      queue.push({ x, y: y + 1 });
    }
  }

  // 배경 픽셀을 투명하게
  for (let i = 0; i < totalPixels; i++) {
    if (isBackground[i]) {
      rawBuffer[i * 4 + 3] = 0;
    }
  }

  // 가장자리 안티앨리어싱
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (!isBackground[idx]) {
        const neighbors = [
          isBackground[idx - 1],
          isBackground[idx + 1],
          isBackground[idx - width],
          isBackground[idx + width],
        ];
        const bgNeighbors = neighbors.filter(n => n).length;
        if (bgNeighbors > 0 && bgNeighbors < 4) {
          const alpha = rawBuffer[idx * 4 + 3];
          rawBuffer[idx * 4 + 3] = Math.round(alpha * (1 - bgNeighbors * 0.12));
        }
      }
    }
  }

  return rawBuffer;
}

async function processIcon(inputPath, outputPath) {
  try {
    // 1. 이미지를 작업 크기로 리사이즈하고 raw로 변환
    const resized = await sharp(inputPath)
      .resize(WORK_SIZE, WORK_SIZE, { fit: 'inside', withoutEnlargement: false })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width, height } = resized.info;

    // 2. 배경 제거
    const noBgBuffer = await removeBackground(resized.data, width, height);

    // 3. 다시 sharp 객체로 변환
    const noBgImage = sharp(noBgBuffer, {
      raw: { width, height, channels: 4 }
    });

    // 4. Trim (투명 영역 제거)
    let trimmedPng, trimInfo;
    try {
      const result = await noBgImage.clone()
        .trim({ threshold: 10 })
        .png()
        .toBuffer({ resolveWithObject: true });
      trimmedPng = result.data;
      trimInfo = result.info;
    } catch (trimError) {
      // trim 실패 시 원본 사용
      const result = await noBgImage.clone()
        .png()
        .toBuffer({ resolveWithObject: true });
      trimmedPng = result.data;
      trimInfo = { width, height };
    }

    // 5. 정사각형으로 만들고 패딩 추가 (extend 방식 - 더 안정적)
    const imgWidth = trimInfo.width;
    const imgHeight = trimInfo.height;
    const maxDim = Math.max(imgWidth, imgHeight);
    const padding = Math.round(maxDim * PADDING_PERCENT);

    // 정사각형으로 만들기 위한 extend 값 계산
    const widthDiff = maxDim - imgWidth;
    const heightDiff = maxDim - imgHeight;

    const extendTop = Math.floor(heightDiff / 2) + padding;
    const extendBottom = Math.ceil(heightDiff / 2) + padding;
    const extendLeft = Math.floor(widthDiff / 2) + padding;
    const extendRight = Math.ceil(widthDiff / 2) + padding;

    // 6. extend로 정사각형 + 패딩 추가 후 리사이즈
    await sharp(trimmedPng)
      .extend({
        top: extendTop,
        bottom: extendBottom,
        left: extendLeft,
        right: extendRight,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .resize(OUTPUT_SIZE, OUTPUT_SIZE, { fit: 'fill' })
      .png()
      .toFile(outputPath);

    return true;
  } catch (error) {
    console.error(`Error: ${error.message}`);
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
    .filter(f => f.toLowerCase().endsWith('.png'));

  console.log(`Found ${files.length} PNG files to process...`);
  console.log('Using v3 processing: background removal + trim + resize\n');

  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;

  for (const file of files) {
    const baseName = file.replace('.png', '');

    // 건너뛸 파일인지 확인
    if (SKIP_FILES.includes(baseName)) {
      console.log(`Skipping: ${file} (not in DB)`);
      skipCount++;
      continue;
    }

    // 파일명 변환
    const outputName = FILE_NAME_MAPPING[baseName] || baseName;
    const inputPath = path.join(INPUT_DIR, file);
    const outputPath = path.join(OUTPUT_DIR, outputName + '.png');

    process.stdout.write(`Processing: ${baseName}`);
    if (outputName !== baseName) {
      process.stdout.write(` → ${outputName}`);
    }
    process.stdout.write('... ');

    const success = await processIcon(inputPath, outputPath);
    if (success) {
      console.log('✓');
      successCount++;
    } else {
      console.log('✗');
      failCount++;
    }
  }

  console.log(`\n========================================`);
  console.log(`Done! Success: ${successCount}, Skipped: ${skipCount}, Failed: ${failCount}`);
  console.log(`Output directory: ${OUTPUT_DIR}`);
}

main().catch(console.error);
