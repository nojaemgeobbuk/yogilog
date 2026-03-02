/**
 * trim-asana-icons.js
 *
 * 아사나 아이콘 PNG 파일의 투명 여백을 자동으로 제거하고
 * 512×512 캔버스 안에 5% 여백을 두고 중앙 배치합니다.
 *
 * 사용법: node scripts/trim-asana-icons.js
 */

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const ICONS_DIR = path.join(__dirname, "../assets/images/asana-icons");
const TARGET_SIZE = 512;
const PADDING = Math.round(TARGET_SIZE * 0.05); // 5% = 26px
const CONTENT_SIZE = TARGET_SIZE - PADDING * 2;  // 460px

async function processIcon(filePath) {
  const filename = path.basename(filePath);
  const originalSize = fs.statSync(filePath).size;

  try {
    // 1단계: 투명 여백 제거 (PNG 버퍼로 출력)
    const trimmedPng = await sharp(filePath)
      .trim({ threshold: 2 })
      .png()
      .toBuffer();

    const meta = await sharp(trimmedPng).metadata();
    const { width: tw, height: th } = meta;
    const originalFill = Math.max(tw, th) / TARGET_SIZE;

    // 이미 90% 이상 채우고 있으면 스킵
    if (originalFill >= 0.90) {
      console.log(`  skip  ${filename} (already ${Math.round(originalFill * 100)}% fill)`);
      return;
    }

    // 2단계: 460×460 안에 비율 유지하며 리사이즈
    const resized = await sharp(trimmedPng)
      .resize(CONTENT_SIZE, CONTENT_SIZE, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();

    // 3단계: 512×512 투명 캔버스 중앙에 합성
    await sharp({
      create: {
        width: TARGET_SIZE,
        height: TARGET_SIZE,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([{ input: resized, gravity: "center" }])
      .png({ compressionLevel: 9 })
      .toFile(filePath);

    const newSize = fs.statSync(filePath).size;
    const fillPct = Math.round(originalFill * 100);
    console.log(
      `  fixed ${filename}: ${fillPct}% → ~90% fill  (${Math.round(originalSize / 1024)}KB → ${Math.round(newSize / 1024)}KB)`
    );
  } catch (err) {
    console.error(`  ERROR ${filename}: ${err.message}`);
  }
}

async function main() {
  const files = fs
    .readdirSync(ICONS_DIR)
    .filter((f) => f.endsWith(".png"))
    .map((f) => path.join(ICONS_DIR, f));

  console.log(`아사나 아이콘 ${files.length}개 처리 중...\n`);

  for (const file of files) {
    await processIcon(file);
  }

  console.log("\n완료!");
}

main().catch(console.error);
