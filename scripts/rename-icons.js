/**
 * PNG 아이콘 파일명에서 공백 제거
 * "Adho Mukha Svanasana.png" → "AdhoMukhaSvanasana.png"
 */
const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.join(__dirname, '../assets/images/asana-icons');

// 파일명 변환: 공백 제거
function removeSpaces(filename) {
  const ext = path.extname(filename);
  const name = path.basename(filename, ext);
  const newName = name.replace(/ /g, '');
  return newName + ext;
}

async function main() {
  const files = fs.readdirSync(ICONS_DIR).filter(f => f.endsWith('.png'));

  console.log(`Found ${files.length} PNG files\n`);

  const renames = [];

  for (const file of files) {
    const newName = removeSpaces(file);
    if (file !== newName) {
      renames.push({ old: file, new: newName });
    }
  }

  console.log(`Files to rename: ${renames.length}\n`);

  // 실제 리네임 수행
  for (const { old: oldName, new: newName } of renames) {
    const oldPath = path.join(ICONS_DIR, oldName);
    const newPath = path.join(ICONS_DIR, newName);

    fs.renameSync(oldPath, newPath);
    console.log(`${oldName} → ${newName}`);
  }

  console.log('\nDone!');

  // 새 import 문 생성을 위한 매핑 출력
  console.log('\n=== New imports ===\n');

  const allFiles = fs.readdirSync(ICONS_DIR).filter(f => f.endsWith('.png')).sort();

  for (const file of allFiles) {
    const name = file.replace('.png', '');
    const varName = name.replace(/ /g, '') + 'Png';
    console.log(`import ${varName} from "@/assets/images/asana-icons/${file}";`);
  }
}

main().catch(console.error);
