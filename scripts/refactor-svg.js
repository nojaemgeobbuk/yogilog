/**
 * SVG 일괄 리팩토링 스크립트
 *
 * 규칙:
 * 1. 배경 제거: fill="#020302" 또는 배경 전체를 덮는 첫 번째 <path> 삭제
 * 2. 캔버스 최적화: width/height 속성 제거, viewBox="0 0 2816 1536" 고정
 * 3. 색상 단일화: 모든 <path>의 fill 속성 제거, <g fill="#4FD1C5">로 감싸기
 * 4. 메타 태그 제거: <?xml ?>, version, 주석 등 삭제
 */

const fs = require('fs');
const path = require('path');

// 처리할 파일 목록
const targetFiles = [
  'Balasana.svg',
  'Adho Mukha Svanasana.svg',
  'Virabhadrasana II.svg',
  'Sukhasana.svg',
  'Phalakasana.svg',
  'Ananda Balasana.svg',
  'Baddha Konasana.svg',
  'Virabhadrasana III.svg',
  'Eka Pada Rajakapotasana.svg',
  'Navasana.svg',
  'Garudasana.svg',
  'Utkatasana.svg',
  'Salamba Sarvangasana.svg',
  'Halasana.svg',
  'Camatkarasana.svg',
  'Chaturanga Dandasana.svg',
  'Malasana.svg',
  'Dhanurasana.svg',
  'Urdhva Dhanurasana.svg',
  'Astavakrasana.svg',
];

const svgDir = path.join(__dirname, '../assets/images/icons-optimized');

function refactorSvg(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // 1. XML 선언, 주석, DOCTYPE 제거
  content = content.replace(/<\?xml[^?]*\?>/gi, '');
  content = content.replace(/<!DOCTYPE[^>]*>/gi, '');
  content = content.replace(/<!--[\s\S]*?-->/g, '');

  // 2. <svg> 태그 정규화
  // version, xmlns:xlink, xml:space 등 불필요한 속성 제거
  content = content.replace(
    /<svg[^>]*>/i,
    '<svg viewBox="0 0 2816 1536" xmlns="http://www.w3.org/2000/svg">'
  );

  // 3. 배경 path 제거 (첫 번째 path가 전체 캔버스를 덮는 경우)
  // 패턴: "M0 0 C...2816 0...1536...0 0 Z" 형태
  const backgroundPatterns = [
    // fill="#020302" 배경
    /<path[^>]*fill="#020302"[^>]*\/>/gi,
    // fill="currentColor" 배경 (전체 캔버스)
    /<path[^>]*d="M0 0[^"]*2816 0[^"]*1536[^"]*0 0[^"]*Z[^"]*"[^>]*\/>/gi,
    // transform="translate(0,0)" 포함 배경
    /<path[^>]*d="M0 0[^"]*2816[^"]*1536[^"]*Z\s*"[^>]*transform="translate\(0,0\)"[^>]*\/>/gi,
  ];

  backgroundPatterns.forEach(pattern => {
    content = content.replace(pattern, '');
  });

  // 4. 모든 path의 fill 속성 제거
  content = content.replace(/(<path[^>]*)\s+fill="[^"]*"/gi, '$1');
  content = content.replace(/(<path[^>]*)\s+fill='[^']*'/gi, '$1');

  // 5. <g fill="#4FD1C5">로 모든 path 감싸기
  // 기존 <g> 태그 제거 (있다면)
  content = content.replace(/<g[^>]*>/gi, '');
  content = content.replace(/<\/g>/gi, '');

  // </svg> 앞에 </g> 추가, <svg ...> 뒤에 <g fill="#4FD1C5"> 추가
  content = content.replace(
    /(<svg[^>]*>)/i,
    '$1\n<g fill="#4FD1C5">'
  );
  content = content.replace(
    /<\/svg>/i,
    '</g>\n</svg>'
  );

  // 6. 공백 정리
  content = content.replace(/\n\s*\n/g, '\n');
  content = content.trim();

  return content;
}

// 메인 실행
console.log('SVG 리팩토링 시작...\n');

let successCount = 0;
let errorCount = 0;

targetFiles.forEach(fileName => {
  const filePath = path.join(svgDir, fileName);

  if (!fs.existsSync(filePath)) {
    console.log(`❌ 파일 없음: ${fileName}`);
    errorCount++;
    return;
  }

  try {
    const refactored = refactorSvg(filePath);
    fs.writeFileSync(filePath, refactored, 'utf-8');
    console.log(`✅ 완료: ${fileName}`);
    successCount++;
  } catch (error) {
    console.log(`❌ 에러: ${fileName} - ${error.message}`);
    errorCount++;
  }
});

console.log(`\n리팩토링 완료: ${successCount}개 성공, ${errorCount}개 실패`);
