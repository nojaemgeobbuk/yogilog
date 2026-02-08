/**
 * 파일명과 AsanaDB 불일치 확인 스크립트
 */
const fs = require('fs');
const path = require('path');

// new-asanapng 파일명
const pngDir = path.join(__dirname, '../assets/images/new-asanapng');
const pngFiles = fs.readdirSync(pngDir)
  .filter(f => f.endsWith('.png'))
  .map(f => f.replace('.png', ''));

// AsanaDB.ts 파일에서 sanskrit 이름 추출
const asanaDbPath = path.join(__dirname, '../constants/AsanaDB.ts');
const asanaDbContent = fs.readFileSync(asanaDbPath, 'utf-8');
const sanskritRegex = /sanskrit:\s*"([^"]+)"/g;
const sanskritNames = [];
let match;
while ((match = sanskritRegex.exec(asanaDbContent)) !== null) {
  sanskritNames.push(match[1]);
}

// 파일에는 있지만 DB에 없는 것
const inFileNotInDb = pngFiles.filter(f => !sanskritNames.includes(f));
// DB에는 있지만 파일에 없는 것
const inDbNotInFile = sanskritNames.filter(s => !pngFiles.includes(s));

console.log('=== 파일에만 있음 (DB에 없음) ===');
inFileNotInDb.forEach(f => console.log('  ' + f));

console.log('\n=== DB에만 있음 (파일 없음) ===');
inDbNotInFile.forEach(s => console.log('  ' + s));

console.log('\n파일 총: ' + pngFiles.length);
console.log('DB 총: ' + sanskritNames.length);
console.log('일치 항목: ' + (pngFiles.length - inFileNotInDb.length));
