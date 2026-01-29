/**
 * SVG 아이콘 일괄 최적화 스크립트
 * 실행: node scripts/optimize-svgs.js
 *
 * 최적화 내용:
 * 1. 배경 path 제거 (밝은 색으로 전체를 채우는 첫 번째 path)
 * 2. width/height → viewBox 변환
 * 3. 모든 fill을 currentColor로 변경
 */

const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.join(__dirname, '../assets/images/icons');
const OUTPUT_DIR = path.join(__dirname, '../assets/images/icons-optimized');

// 출력 디렉토리 생성
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// SVG 파일 목록
const svgFiles = fs.readdirSync(ICONS_DIR).filter(f => f.endsWith('.svg'));

console.log(`Found ${svgFiles.length} SVG files to optimize...\n`);

let successCount = 0;
let errorCount = 0;

svgFiles.forEach(filename => {
  try {
    const inputPath = path.join(ICONS_DIR, filename);
    const outputPath = path.join(OUTPUT_DIR, filename);

    let content = fs.readFileSync(inputPath, 'utf8');

    // 1. width, height 추출하여 viewBox 설정
    const widthMatch = content.match(/width="([^"]+)"/);
    const heightMatch = content.match(/height="([^"]+)"/);
    const viewBoxMatch = content.match(/viewBox="([^"]+)"/);

    let width = 400, height = 400;
    if (widthMatch) width = parseFloat(widthMatch[1]);
    if (heightMatch) height = parseFloat(heightMatch[1]);

    let viewBox = viewBoxMatch
      ? viewBoxMatch[1].replace(/,/g, ' ').trim()
      : `0 0 ${width} ${height}`;

    // 2. width, height 속성 제거
    content = content.replace(/\s*width="[^"]+"/g, '');
    content = content.replace(/\s*height="[^"]+"/g, '');

    // 3. viewBox 업데이트 또는 추가
    if (viewBoxMatch) {
      content = content.replace(/viewBox="[^"]+"/, `viewBox="${viewBox}"`);
    } else {
      content = content.replace(/<svg/, `<svg viewBox="${viewBox}"`);
    }

    // 4. 첫 번째 배경 path 제거
    // 배경 특징: fill이 밝은 색(#F로 시작), 전체 크기를 덮는 사각형
    // 패턴: "M0 0 C... Z" 형태로 시작하고 전체 크기 좌표 포함
    const pathRegex = /<path\s+d="M0\s+0\s+C[^"]*"\s+fill="#[Ff][^"]*"[^/]*\/>/;
    content = content.replace(pathRegex, '');

    // 5. 모든 fill 속성을 currentColor로 변경
    content = content.replace(/fill="#[0-9a-fA-F]+"/g, 'fill="currentColor"');

    // 6. stroke가 있으면 currentColor로
    content = content.replace(/stroke="#[0-9a-fA-F]+"/g, 'stroke="currentColor"');

    // 7. 불필요한 속성 정리
    content = content.replace(/\s*xmlns:xlink="[^"]+"/g, '');
    content = content.replace(/\s*version="[^"]+"/g, '');

    // 8. XML 선언 제거 (React Native에서 불필요)
    content = content.replace(/<\?xml[^?]*\?>\s*/g, '');

    // 9. 빈 줄 정리
    content = content.replace(/\n\s*\n/g, '\n');
    content = content.trim();

    fs.writeFileSync(outputPath, content, 'utf8');
    console.log(`✓ Optimized: ${filename}`);
    successCount++;
  } catch (error) {
    console.error(`✗ Error processing ${filename}:`, error.message);
    errorCount++;
  }
});

console.log(`\n✅ Done! Optimized ${successCount} files to: ${OUTPUT_DIR}`);
if (errorCount > 0) {
  console.log(`⚠️ ${errorCount} files had errors`);
}
console.log('\nNext steps:');
console.log('1. Review the optimized SVGs in assets/images/icons-optimized/');
console.log('2. Update AsanaIcon.tsx to use SVG components with color prop');
