/**
 * PNG 아이콘 배경 제거 스크립트 v2
 * Flood fill 방식으로 모서리에서 시작하여 배경 제거
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const INPUT_DIR = path.join(__dirname, '../assets/images/new-asanapng');
const OUTPUT_DIR = path.join(__dirname, '../assets/images/asana-icons');

// 색상 거리 계산
function colorDistance(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt(
    Math.pow(r1 - r2, 2) +
    Math.pow(g1 - g2, 2) +
    Math.pow(b1 - b2, 2)
  );
}

// 밝은 색인지 확인 (배경일 가능성)
function isLightColor(r, g, b) {
  // 밝기 계산 (YIQ 공식)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 200; // 밝은 색 기준
}

async function removeBackground(inputPath, outputPath) {
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    const { width, height } = metadata;

    // raw 픽셀 데이터로 변환 (RGBA)
    const rawBuffer = await image
      .ensureAlpha()
      .raw()
      .toBuffer();

    // 4개 모서리의 색상 샘플링
    const corners = [
      { x: 0, y: 0 },
      { x: width - 1, y: 0 },
      { x: 0, y: height - 1 },
      { x: width - 1, y: height - 1 },
    ];

    // 모서리 색상들 수집
    const cornerColors = corners.map(({ x, y }) => {
      const offset = (y * width + x) * 4;
      return {
        r: rawBuffer[offset],
        g: rawBuffer[offset + 1],
        b: rawBuffer[offset + 2],
      };
    });

    // 가장 많이 나타나는 밝은 색 찾기 (배경색으로 추정)
    const lightCorners = cornerColors.filter(c => isLightColor(c.r, c.g, c.b));

    if (lightCorners.length === 0) {
      // 밝은 모서리가 없으면 그냥 복사
      await sharp(inputPath).toFile(outputPath);
      return true;
    }

    // 평균 배경색 계산
    const bgColor = {
      r: Math.round(lightCorners.reduce((s, c) => s + c.r, 0) / lightCorners.length),
      g: Math.round(lightCorners.reduce((s, c) => s + c.g, 0) / lightCorners.length),
      b: Math.round(lightCorners.reduce((s, c) => s + c.b, 0) / lightCorners.length),
    };

    // Flood fill로 배경 영역 마킹
    const visited = new Uint8Array(width * height);
    const isBackground = new Uint8Array(width * height);
    const queue = [];

    // 모서리에서 시작
    corners.forEach(({ x, y }) => {
      const idx = y * width + x;
      if (!visited[idx]) {
        queue.push({ x, y });
      }
    });

    // 가장자리 전체에서도 시작
    for (let x = 0; x < width; x++) {
      queue.push({ x, y: 0 });
      queue.push({ x, y: height - 1 });
    }
    for (let y = 0; y < height; y++) {
      queue.push({ x: 0, y });
      queue.push({ x: width - 1, y });
    }

    // BFS로 배경 탐색
    const threshold = 40; // 색상 허용 오차

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

      // 배경색과 비슷하거나 밝은 색이면 배경으로 처리
      const distToBg = colorDistance(r, g, b, bgColor.r, bgColor.g, bgColor.b);
      const isBgLike = distToBg < threshold || (isLightColor(r, g, b) && distToBg < threshold * 2);

      if (isBgLike) {
        isBackground[idx] = 1;

        // 인접 픽셀 탐색
        queue.push({ x: x - 1, y });
        queue.push({ x: x + 1, y });
        queue.push({ x, y: y - 1 });
        queue.push({ x, y: y + 1 });
      }
    }

    // 배경 픽셀을 투명하게
    for (let i = 0; i < width * height; i++) {
      if (isBackground[i]) {
        rawBuffer[i * 4 + 3] = 0; // 알파 = 0
      }
    }

    // 가장자리 안티앨리어싱 (부드럽게)
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        if (!isBackground[idx]) {
          // 주변에 배경이 있으면 알파 조절
          const neighbors = [
            isBackground[idx - 1],
            isBackground[idx + 1],
            isBackground[idx - width],
            isBackground[idx + width],
          ];
          const bgNeighbors = neighbors.filter(n => n).length;
          if (bgNeighbors > 0 && bgNeighbors < 4) {
            // 부분적으로 투명하게 (안티앨리어싱)
            const alpha = rawBuffer[idx * 4 + 3];
            rawBuffer[idx * 4 + 3] = Math.round(alpha * (1 - bgNeighbors * 0.15));
          }
        }
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
  console.log('Using flood-fill background removal (v2)\n');

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
