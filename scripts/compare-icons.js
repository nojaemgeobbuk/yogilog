const fs = require('fs');

// 아이콘 파일 목록 (확장자 제거)
const iconDir = 'assets/images/asana-icons';
const icons = fs.readdirSync(iconDir)
  .filter(f => f.endsWith('.png'))
  .map(f => f.replace('.png', '').toLowerCase().trim());

// AsanaDB에서 산스크리트 이름 추출
const dbContent = fs.readFileSync('constants/AsanaDB.ts', 'utf8');
const sanskritMatches = dbContent.match(/sanskrit: "([^"]+)"/g);
const asanas = sanskritMatches.map(m => m.match(/"([^"]+)"/)[1].toLowerCase());

console.log(`아이콘 파일: ${icons.length}개`);
console.log(`AsanaDB 항목: ${asanas.length}개`);

// 정확한 매칭 확인
const iconSet = new Set(icons);
const asanaSet = new Set(asanas);

console.log('\n=== AsanaDB에 있지만 아이콘 없음 ===');
const missingIcons = [];
asanas.forEach(a => {
  const hasIcon = icons.some(i => {
    // 정확히 일치하거나 비슷한 이름
    return i === a ||
           i.replace(/ /g, '') === a.replace(/ /g, '') ||
           i.includes(a) ||
           a.includes(i);
  });
  if (!hasIcon) {
    missingIcons.push(a);
    console.log(`  - ${a}`);
  }
});

console.log('\n=== 아이콘 있지만 AsanaDB에 없거나 이름 다름 ===');
const unmatchedIcons = [];
icons.forEach(i => {
  const hasAsana = asanas.some(a => {
    return a === i ||
           a.replace(/ /g, '') === i.replace(/ /g, '') ||
           a.includes(i) ||
           i.includes(a);
  });
  if (!hasAsana) {
    unmatchedIcons.push(i);
    console.log(`  - ${i}`);
  }
});

console.log(`\n누락된 아이콘: ${missingIcons.length}개`);
console.log(`매칭 안된 아이콘: ${unmatchedIcons.length}개`);
