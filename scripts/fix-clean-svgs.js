/**
 * Clean SVG 파일들의 품질 문제 수정 스크립트
 *
 * 해결하는 문제:
 * 1. 직사각형 테두리 path 제거 (M0 0h...H0z 패턴)
 * 2. viewBox를 콘텐츠에 맞게 조정
 * 3. stroke-width를 적절한 값으로 조정
 */

const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.join(__dirname, '../assets/images/icons');

// 직사각형 테두리 패턴 (viewBox 전체를 덮는 path)
const RECT_BORDER_PATTERNS = [
  /<path d="M0 0h\d+v\d+H0z"\/>/g,
  /<path d="M0 0h\d+v\d+H0Z"\/>/gi,
  /<path d="M ?0 ?0 ?[hHvVlL][^"]*[zZ]"\/>/g, // 더 일반적인 패턴
];

function fixSvgFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const fileName = path.basename(filePath);
  const issues = [];

  // 1. 직사각형 테두리 path 제거
  for (const pattern of RECT_BORDER_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, '');
      issues.push(`직사각형 테두리 제거: ${matches.length}개`);
      modified = true;
    }
  }

  // viewBox 파싱
  const viewBoxMatch = content.match(/viewBox="([^"]+)"/);
  if (!viewBoxMatch) {
    console.log(`[SKIP] ${fileName}: viewBox 없음`);
    return { modified: false, issues: [] };
  }

  const [minX, minY, width, height] = viewBoxMatch[1].split(' ').map(Number);

  // 2. 매우 큰 viewBox 확인 (2000 이상이면 크다고 판단)
  if (width > 2000 || height > 2000) {
    issues.push(`큰 viewBox: ${width}x${height}`);

    // stroke-width 조정 (비율에 맞게)
    const strokeMatch = content.match(/stroke-width="(\d+)"/);
    if (strokeMatch) {
      const currentStroke = parseInt(strokeMatch[1]);
      // 100x100 기준으로 스케일링 (대략 1-2 정도가 적당)
      const scaleFactor = Math.max(width, height) / 100;
      const newStroke = Math.max(1, Math.round(currentStroke / scaleFactor * 10) / 10);

      if (newStroke !== currentStroke) {
        content = content.replace(
          /stroke-width="\d+"/,
          `stroke-width="${newStroke}"`
        );
        issues.push(`stroke-width: ${currentStroke} → ${newStroke}`);
        modified = true;
      }
    }
  }

  // 3. 빈 path 제거
  const emptyPaths = content.match(/<path d=""\/?>/g);
  if (emptyPaths) {
    content = content.replace(/<path d=""\/?>/g, '');
    issues.push(`빈 path 제거: ${emptyPaths.length}개`);
    modified = true;
  }

  // 4. 연속된 공백 정리
  content = content.replace(/>\s+</g, '><');

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[FIXED] ${fileName}`);
    issues.forEach(issue => console.log(`        - ${issue}`));
  } else {
    console.log(`[OK] ${fileName}`);
  }

  return { modified, issues };
}

function main() {
  console.log('=== Clean SVG 파일 수정 시작 ===\n');

  // _clean.svg 파일들 찾기
  const files = fs.readdirSync(ICONS_DIR)
    .filter(f => f.endsWith('_clean.svg'))
    .map(f => path.join(ICONS_DIR, f));

  console.log(`발견된 파일: ${files.length}개\n`);

  let fixedCount = 0;
  const allIssues = [];

  for (const file of files) {
    const result = fixSvgFile(file);
    if (result.modified) {
      fixedCount++;
      allIssues.push({ file: path.basename(file), issues: result.issues });
    }
  }

  console.log('\n=== 요약 ===');
  console.log(`총 파일: ${files.length}개`);
  console.log(`수정된 파일: ${fixedCount}개`);

  if (allIssues.length > 0) {
    console.log('\n수정 상세:');
    allIssues.forEach(({ file, issues }) => {
      console.log(`  ${file}:`);
      issues.forEach(issue => console.log(`    - ${issue}`));
    });
  }
}

main();
