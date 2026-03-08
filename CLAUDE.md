# Yogilog Project Rules

## 🤖 AI Behavior & MCP Tools

### 우선순위 도구 사용
- **Serena MCP 우선 사용**: 코드 구조 파악, 함수 정의 찾기, 파일 간 참조 확인 시 `grep` 대신 `serena` 도구를 최우선으로 사용하라.
  - `serena.find_symbol`: 특정 함수, 클래스, 타입 찾기
  - `serena.find_references`: 코드 참조 위치 찾기
  - `serena.create_memory`: 주요 변경사항 기록
- **컨텍스트 최적화**: 모든 파일을 읽기 전에 `serena.find_symbol`로 필요한 부분만 타겟팅하여 토큰을 아껴라.
- **최신 문서**: 외부 라이브러리(WatermelonDB, Expo, Lucide 등) 사용법이 헷갈릴 때는 `context7`을 사용해 최신 문서를 참조하라.
- **Sequential Thinking MCP**: 복잡한 버그 수정, 아키텍처 설계, 혹은 논리적 판단이 필요한 경우 '생각 단계(Thoughts)'를 세분화하여 접근하라.

---

## 💻 Tech Stack & Architecture

### Frontend
- **Framework**: React Native 0.81.5 + Expo 54.x
- **Navigation**: Expo Router 6.x (파일 시스템 기반 라우팅)
- **Styling**: NativeWind 4.x (Tailwind CSS for React Native)
- **Animations**: React Native Reanimated 4.x

### Database & State
- **Local Database**: WatermelonDB 0.28.x (SQLite 기반)
  - 모든 수련 기록, 아사나, 시퀀스 데이터 저장
  - Reactive queries (Observable 기반)
- **State Management**:
  - Zustand 5.x (앱 설정, 시퀀스 빌더 임시 상태)
  - AsyncStorage (설정 영속화)
- **Date Handling**: date-fns 4.x (날짜 파싱/포맷팅)

### Key Dependencies
- `@nozbe/watermelondb`: 로컬 DB
- `@nozbe/simdjson`: 고성능 JSON 파서 (WatermelonDB 필수)
- `lucide-react-native`: 아이콘 라이브러리
- `react-native-pell-rich-editor`: Rich Text Editor
- `expo-image-picker`: 이미지 선택
- `react-native-view-shot`: 화면 캡처
- `jszip`: 백업 파일 압축

---

## 🏗 프로젝트 구조 & 핵심 파일

### 데이터베이스 모델 (`database/models/`)
1. **PracticeLog** (`PracticeLog.ts`): 수련 기록
   - Fields: title, date, duration, intensity, note, location, isFavorite
   - Relations: practiceLogAsanas (M:M), practiceLogPhotos (1:M)

2. **Asana** (`Asana.ts`): 아사나 마스터 데이터
   - Fields: sanskritName, englishName, koreanName, category, difficulty
   - Relations: practiceLogAsanas, sequenceAsanas

3. **Sequence** (`Sequence.ts`): 요가 시퀀스
   - Fields: name, description, duration, difficulty
   - Relations: sequenceAsanas (1:M)

4. **PracticeLogAsana** (`PracticeLogAsana.ts`): 수련-아사나 중간 테이블
   - Fields: practiceLogId, asanaId, position, status, note
   - Status: 'success' | 'failed' | 'skipped'

5. **PracticeLogPhoto** (`PracticeLogPhoto.ts`): 수련 사진
   - Fields: practiceLogId, uri, position

6. **SequenceAsana** (`SequenceAsana.ts`): 시퀀스-아사나 중간 테이블
   - Fields: sequenceId, asanaId, position, duration

### 주요 훅 (`hooks/`)
- **usePracticeLogs.ts**: 수련 기록 CRUD 로직
  - `useAllPracticeLogs()`: 전체 목록 (Observable)
  - `usePracticeLog(id)`: 단일 기록
  - `createPracticeLog()`, `updatePracticeLog()`, `deletePracticeLog()`

- **useAsanas.ts**: 아사나 CRUD 로직
  - `useAllAsanas()`: 전체 아사나 목록
  - `getOrCreateAsana()`: 아사나 조회 또는 생성

- **useSequences.ts**: 시퀀스 CRUD 로직

- **useAsanaGrowthLevel.ts**: 아사나별 성장 레벨 계산
  - 수행 횟수 → 레벨 매핑 (Seed, Sprout, Sapling, Tree, Forest)

### 주요 컴포넌트 (`components/`)
- **AsanaIcon.tsx**: 아사나 아이콘 렌더러 (PNG 기반, 100+ 아이콘)
- **AsanaGrowthTree.tsx**: 아사나 성장 트리 시각화
- **SequenceBuilderBar.tsx**: 시퀀스 빌더 하단 바
- **RichTextEditor.tsx**: HTML 기반 리치 텍스트 에디터
- **Carousel.tsx**: 커버플로우 스타일 캐러셀
- **LotusSplash.tsx**: 로터스 로딩 애니메이션
- **PracticeDeckCard.tsx**: 카드 데크 스타일 수련 기록 카드
- **AlbumPlaylist.tsx**: 앨범 스타일 세션 리스트
- **ShareCard.tsx**: 공유용 카드
- **SkeletonCard.tsx**: 로딩 스켈레톤 카드

### 상수 (`constants/`)
- **AsanaDB.ts**: 100+ 아사나 데이터베이스 (이름, 카테고리, 난이도 등)
- **AsanaDefinitions.ts**: 아사나 카테고리 & 정의
- **Colors.ts**: 앱 테마 컬러 팔레트

### 유틸리티 (`utils/`)
- **exportBackup.ts**: 전체 데이터 JSON 내보내기 (ZIP)
- **importBackup.ts**: 백업 파일에서 데이터 복원
- **formatDate.ts**: 날짜 포맷팅 유틸리티
- **share.ts**: 네이티브 공유 기능

---

## 📝 Coding Style & Best Practices

### 일반 원칙
- **함수형 컴포넌트**: 클래스 컴포넌트 사용 금지
- **TypeScript 엄격 모드**: 타입 명시, `any` 최소화
- **직관적인 변수명**: 약어보다 명확한 이름 선호
- **컴포넌트 분리**: 단일 책임 원칙, 재사용 가능하게 설계

### WatermelonDB 사용 규칙
1. **Observable 사용**:
   ```typescript
   // ❌ 잘못된 예
   const logs = await database.get('practice_logs').query().fetch()

   // ✅ 올바른 예
   const logs = useObservable(() =>
     database.get('practice_logs').query()
   , [])
   ```

2. **Batch 작업**:
   ```typescript
   // 여러 작업을 한 번에 처리
   await database.write(async () => {
     await log.update(/* ... */)
     await asana.create(/* ... */)
   })
   ```

3. **Query 최적화**:
   ```typescript
   // position 순 정렬
   Q.sortBy('position', Q.asc)

   // 조건 필터링
   Q.where('is_favorite', true)
   ```

### 스타일링 규칙
- **NativeWind 우선**: Tailwind 클래스명 사용 (`className`)
- **Colors 상수 사용**: `constants/Colors.ts`에서 색상 가져오기
- **반응형 고려**: 다양한 화면 크기 대응

### 에러 핸들링
```typescript
try {
  await database.write(async () => {
    // DB 작업
  })
} catch (error) {
  console.error('Failed to save:', error)
  Alert.alert('오류', '저장에 실패했습니다.')
}
```

---

## 🎯 주요 기능별 가이드

### 1. 새 아사나 추가
- **위치**: `constants/AsanaDB.ts`에 데이터 추가
- **아이콘**: `assets/images/asana-icons/` 폴더에 PNG 파일 추가 (산스크리트 이름.png)
- **체크**: `node scripts/check-asana-mismatch.js` 실행하여 아이콘 누락 확인

### 2. DB 스키마 변경
1. `database/schema.ts` 수정
2. `database/migration.ts`에 마이그레이션 추가
3. 버전 번호 증가

### 3. 새 화면 추가
- **라우트**: `app/` 폴더에 파일 생성 (Expo Router 자동 인식)
- **탭**: `app/(tabs)/_layout.tsx`에 탭 정의
- **모달**: `app/(modals)/` 폴더 사용

---

## 🐛 디버깅 & 트러블슈팅

### WatermelonDB 이슈
- **Schema 에러**: 앱 재설치 (DB 초기화)
- **Migration 실패**: `database/migration.ts` 확인
- **simdjson 충돌**: `package.json`의 `overrides` 확인

### Expo 빌드 이슈
- **EAS Build 실패**: `eas.json` 설정 확인
- **SDK 버전 충돌**: `expo-doctor` 실행
- **Native 모듈 이슈**: `plugins/withWatermelonDB.js` 확인

### 성능 최적화
- **리스트 렌더링**: `FlashList` 사용 고려
- **이미지 최적화**: `expo-image` 사용
- **DB 쿼리**: 불필요한 관계 로딩 제거 (`Q.on()` 최소화)

---

## 📝 Memory & Documentation

### 주요 변경사항 기록
- 새로운 주요 기능을 구현하거나 아키텍처를 변경하면 `CLAUDE.md`와 `README.md`를 업데이트하라.
- 예시:
  - "Migrated from AsyncStorage to WatermelonDB for data persistence"
  - "Implemented Asana Growth Tree visualization"
  - "Added Carousel-based home with lotus breath-in button"

### 문서화 우선순위
1. 복잡한 로직 (성장 레벨 계산 등)
2. DB 스키마 변경
3. 새로운 의존성 추가
4. API 변경사항

---

## 🔐 보안 & 데이터 관리

### 민감 정보
- **백업 데이터**: 사진 URI는 로컬 경로만 저장 (클라우드 동기화 시 주의)
- **사용자 데이터**: 로컬 저장만 (현재 백엔드 없음)

### 데이터 무결성
- **Cascade 삭제**: PracticeLog 삭제 시 관련 PracticeLogAsana, PracticeLogPhoto 자동 삭제
- **Validation**: 입력값 검증 (duration > 0, intensity 1-5 등)

---

## 🚀 배포 & 릴리스

### EAS Build
```bash
# Preview 빌드
eas build --profile preview --platform android

# Production 빌드
eas build --profile production --platform all
```

### 버전 관리
- **app.json**: `version` 및 `versionCode` 수동 증가
- **Changelog**: 주요 변경사항 기록

---

## 📚 참고 자료

### 공식 문서
- [WatermelonDB](https://nozbe.github.io/WatermelonDB/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [NativeWind](https://www.nativewind.dev/)
- [Lucide Icons](https://lucide.dev/)

### 프로젝트 관련
- 아사나 이미지: `assets/images/asana-icons/`
- 스크립트: `scripts/` 폴더
- 설정: `eas.json`, `app.json`, `tailwind.config.js`

---

## ⚠️ 중요 주의사항

### ❌ 하지 말아야 할 것
1. **직접 DB 조작**: `database.adapter.execute()` 사용 금지 → WatermelonDB API 사용
2. **동기 작업**: `database.write()` 없이 모델 수정 금지
3. **타입 무시**: `@ts-ignore` 남발 금지
4. **하드코딩**: 색상, 문자열 등은 상수로 관리

### ✅ 반드시 해야 할 것
1. **Observable 사용**: UI에서 DB 데이터 구독
2. **Batch 작업**: 여러 DB 작업은 한 번의 `write()`로
3. **에러 핸들링**: 모든 DB 작업에 try-catch
4. **타입 정의**: 새로운 데이터 구조는 `types/` 폴더에 정의

---

## 🎨 디자인 가이드

### 색상 사용
```typescript
import { Colors } from '@/constants/Colors'

// 배경
backgroundColor: Colors.background

// 주요 액션
backgroundColor: Colors.primary

// 강조 포인트
color: Colors.accent
```

### 일관성 유지
- **카드**: 투명 보라 배경 (`Colors.card`)
- **텍스트**: 흰색 기본, 회색 보조 (`Colors.text`, `Colors.textMuted`)
- **아이콘**: Lucide 아이콘 우선, 커스텀은 `AsanaIcon` 컴포넌트 사용

---

이 문서는 프로젝트 변경사항에 맞춰 지속적으로 업데이트되어야 합니다.
