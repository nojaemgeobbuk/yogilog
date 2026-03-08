# Yogilog (요기로그) `v1.2.0`

키치한 음악 플레이어 UI를 접목한 요가 트래킹 앱. React Native와 Expo로 제작되었습니다.

## 📱 주요 기능

### 🎯 핵심 기능
- **수련 기록**: 요가 세션을 앨범처럼 기록하고 관리
- **시퀀스 빌더**: 나만의 요가 시퀀스를 생성하고 저장
- **아사나 성장 트리**: 아사나별 수련 현황을 시각화
- **히트맵**: 캘린더 기반 수련 히스토리 시각화
- **백업/복원**: JSON 형식으로 데이터 내보내기/가져오기

### 🎨 UI/UX 특징
- Music Player 스타일 인터페이스
- Carousel 기반 세션 탐색 & 카드 데크 뷰
- Rich Text Editor 지원
- 아사나별 커스텀 아이콘 (100+ 아사나)
- Lotus 애니메이션 & 호흡 기록 버튼

---

## 🛠 Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | React Native (Expo) | 54.x |
| Navigation | Expo Router | 6.x |
| Styling | NativeWind (Tailwind CSS) | 4.x |
| Database | WatermelonDB | 0.28.x |
| Animations | React Native Reanimated | 4.x |
| Gestures | React Native Gesture Handler | 2.x |
| Storage | AsyncStorage | 2.x |
| Icons | Lucide React Native | 0.562.x |
| Date Utils | date-fns | 4.x |

---

## 📦 주요 Dependencies

### Core
```json
{
  "expo": "~54.0.32",
  "expo-router": "~6.0.22",
  "react": "19.1.0",
  "react-native": "0.81.5"
}
```

### Database & Storage
- `@nozbe/watermelondb`: 로컬 데이터베이스
- `@nozbe/simdjson`: JSON 파서 (WatermelonDB용)
- `@react-native-async-storage/async-storage`: 설정 저장

### Styling & Animation
- `nativewind`: Tailwind CSS for React Native
- `react-native-reanimated`: 고성능 애니메이션
- `react-native-gesture-handler`: 제스처 핸들링

### UI Components
- `lucide-react-native`: 아이콘 라이브러리
- `react-native-calendars`: 캘린더 컴포넌트
- `react-native-pell-rich-editor`: 리치 텍스트 에디터
- `react-native-svg`: SVG 지원

### Media & Sharing
- `expo-image-picker`: 갤러리에서 사진 선택
- `react-native-view-shot`: 뷰를 이미지로 캡처
- `expo-sharing`: 네이티브 공유 시트
- `expo-document-picker`: 파일 선택 (백업 복원)

### Utilities
- `date-fns`: 날짜 포맷팅
- `jszip`: 백업 파일 압축
- `uuid`: UUID 생성

---

## 🗂 프로젝트 구조

```
yogilog/
├── app/                          # Expo Router 기반 화면
│   ├── (tabs)/
│   │   ├── _layout.tsx          # 탭 네비게이터
│   │   ├── index.tsx            # 홈 (캐러셀 & 앨범 플레이리스트)
│   │   ├── library.tsx          # 아사나 라이브러리
│   │   ├── history.tsx          # 캘린더 히스토리
│   │   └── profile.tsx          # 프로필 & 성장 트리
│   ├── (modals)/
│   │   └── write.tsx            # 세션 작성 모달
│   ├── session/[id].tsx         # 세션 상세 (Now Playing)
│   ├── library/[asanaName].tsx  # 아사나 상세 페이지
│   ├── edit/[id].tsx            # 세션 수정
│   └── settings.tsx             # 설정 페이지
│
├── components/                   # 재사용 가능한 컴포넌트
│   ├── AlbumPlaylist.tsx        # 앨범 스타일 세션 리스트
│   ├── AsanaGrowthTree.tsx      # 아사나 성장 트리 시각화
│   ├── AsanaHeatmap.tsx         # 아사나 히트맵
│   ├── AsanaIcon.tsx            # 아사나 아이콘 렌더러
│   ├── AsanaInput.tsx           # 아사나 자동완성 입력
│   ├── Carousel.tsx             # 커버플로우 캐러셀
│   ├── LotusAnimation.tsx       # 로터스 애니메이션
│   ├── LotusSplash.tsx          # 로터스 스플래시 애니메이션
│   ├── PracticeDeckCard.tsx     # 수련 덱 카드
│   ├── RichTextEditor.tsx       # 리치 텍스트 에디터
│   ├── SaveSequenceModal.tsx    # 시퀀스 저장 모달
│   ├── SequenceBuilderBar.tsx   # 시퀀스 빌더 바
│   ├── SequenceCard.tsx         # 시퀀스 카드
│   ├── SessionCard.tsx          # 세션 카드
│   ├── ShareCard.tsx            # 공유용 카드
│   └── SkeletonCard.tsx         # 로딩 스켈레톤 카드
│
├── database/                     # WatermelonDB 설정
│   ├── models/
│   │   ├── Asana.ts             # 아사나 모델
│   │   ├── Sequence.ts          # 시퀀스 모델
│   │   ├── SequenceAsana.ts     # 시퀀스-아사나 중간 테이블
│   │   ├── PracticeLog.ts       # 수련 기록 모델
│   │   ├── PracticeLogAsana.ts  # 수련-아사나 중간 테이블
│   │   └── PracticeLogPhoto.ts  # 수련 사진 모델
│   ├── schema.ts                # DB 스키마 정의
│   ├── migrations.ts            # DB 마이그레이션
│   └── index.ts                 # DB 초기화
│
├── hooks/                        # 커스텀 훅
│   ├── useAsanaGrowthLevel.ts   # 아사나 성장 레벨 계산
│   ├── useAsanaHeatmap.ts       # 히트맵 데이터
│   ├── useObservable.ts         # WatermelonDB Observable 훅
│   ├── usePracticeLogs.ts       # 수련 기록 CRUD
│   ├── useSequences.ts          # 시퀀스 CRUD
│   └── useAsanas.ts             # 아사나 CRUD
│
├── store/                        # Zustand 스토어 (설정 등)
│   ├── useSequenceBuilderStore.ts # 시퀀스 빌더 상태
│   └── useSettingsStore.ts      # 앱 설정
│
├── constants/
│   ├── AsanaDB.ts               # 100+ 아사나 데이터베이스
│   ├── AsanaDefinitions.ts      # 아사나 정의 & 카테고리
│   └── Colors.ts                # 테마 컬러
│
├── utils/
│   ├── achievements.ts          # 배지 달성 로직
│   ├── exportBackup.ts          # 데이터 내보내기
│   ├── importBackup.ts          # 데이터 가져오기
│   ├── formatDate.ts            # 날짜 포맷팅
│   └── share.ts                 # 공유 기능
│
├── assets/images/
│   └── asana-icons/             # 100+ 아사나 PNG 아이콘
│
└── scripts/                      # 개발용 스크립트
    ├── process-asana-icons.js   # 아이콘 처리
    └── check-asana-mismatch.js  # 아이콘-DB 일치 확인
```

---

## 📱 주요 화면

| Route | File | 설명 |
|-------|------|------|
| `/` | `app/(tabs)/index.tsx` | 홈 - 앨범 플레이리스트 |
| `/library` | `app/(tabs)/library.tsx` | 아사나 라이브러리 (카테고리별) |
| `/history` | `app/(tabs)/history.tsx` | 캘린더 히스토리 & 히트맵 |
| `/profile` | `app/(tabs)/profile.tsx` | 프로필 & 성장 트리 |
| `/session/[id]` | `app/session/[id].tsx` | 세션 상세 (Now Playing) |
| `/library/[asanaName]` | `app/library/[asanaName].tsx` | 아사나 상세 페이지 |
| `/edit/[id]` | `app/edit/[id].tsx` | 세션 수정 |
| `/(modals)/write` | `app/(modals)/write.tsx` | 새 세션 작성 모달 |
| `/settings` | `app/settings.tsx` | 설정 (백업/복원 포함) |

---

## 🗄 데이터 모델 (WatermelonDB)

### PracticeLog (수련 기록)
```typescript
{
  id: string
  title: string
  date: string          // ISO 문자열
  duration: number      // 분 단위
  intensity: number     // 1-5
  note?: string         // HTML 형식
  location?: string
  isFavorite: boolean
  createdAt: Date
  updatedAt: Date

  // Relations
  practiceLogAsanas: PracticeLogAsana[]  // 수행한 아사나 목록
  practiceLogPhotos: PracticeLogPhoto[]  // 사진 목록
}
```

### Asana (아사나)
```typescript
{
  id: string
  sanskritName: string   // 산스크리트 이름
  englishName: string    // 영어 이름
  koreanName?: string    // 한국어 이름
  category: string       // standing, seated, etc.
  difficulty: number     // 1-5
  description?: string
  benefits?: string

  // Relations
  practiceLogAsanas: PracticeLogAsana[]
  sequenceAsanas: SequenceAsana[]
}
```

### Sequence (시퀀스)
```typescript
{
  id: string
  name: string
  description?: string
  duration?: number
  difficulty?: number
  createdAt: Date
  updatedAt: Date

  // Relations
  sequenceAsanas: SequenceAsana[]
}
```

---

## 🎨 테마 컬러

```typescript
const Colors = {
  background: "#121216",       // 다크 배경
  primary: "#A238FF",          // 보라색
  accent: "#CCFF00",           // 네온 옐로우-그린
  card: "rgba(88, 28, 135, 0.8)", // 투명 보라
  cardSolid: "#581C87",        // 단색 보라
  text: "#FFFFFF",             // 흰색 텍스트
  textMuted: "#9CA3AF",        // 회색 텍스트
  border: "#374151",           // 다크 그레이 테두리
}
```

---

## 🚀 시작하기

### 필요 사항
- Node.js 18+
- Expo Go 앱 (iOS/Android)

### 설치
```bash
# 의존성 설치
npm install

# 개발 서버 시작
npx expo start
```

### 디바이스에서 실행
1. App Store / Play Store에서 **Expo Go** 설치
2. 터미널의 QR 코드 스캔
3. 앱이 디바이스에서 로드됩니다

---

## 📝 주요 스크립트

| Command | Description |
|---------|-------------|
| `npm start` | Expo 개발 서버 시작 |
| `npm run android` | Android에서 시작 |
| `npm run ios` | iOS에서 시작 |
| `npm run web` | 웹 브라우저에서 시작 |

---

## 🔧 개발 도구

### 아사나 아이콘 관리
```bash
# 아이콘 처리 (SVG → PNG 변환, 최적화)
node scripts/process-asana-icons.js

# 아이콘-DB 불일치 확인
node scripts/check-asana-mismatch.js
```

---

## 🌟 주요 기능 상세

### 1. 수련 기록 (Practice Logging)
- Rich Text Editor로 상세 노트 작성
- 사진 첨부 (갤러리 선택)
- 아사나별 상태 표시 (성공/실패/건너뜀)
- 강도, 시간, 장소 기록

### 2. 시퀀스 빌더 (Sequence Builder)
- 드래그 앤 드롭으로 아사나 순서 조정
- 시퀀스 저장 및 재사용
- 난이도 및 예상 시간 표시

### 3. 아사나 성장 트리 (Growth Tree)
- 아사나별 수련 횟수 시각화
- 레벨 시스템 (Seed → Sprout → Sapling → Tree → Forest)
- 각 아사나별 성장 현황 확인

### 4. 데이터 백업/복원
- JSON 형식으로 전체 데이터 내보내기 (ZIP)
- 다른 디바이스로 데이터 이동 가능

---

## 📄 라이선스

MIT

---

## 🙏 크레딧

- 아사나 아이콘: [Yoga Pose Icons Collection](https://www.flaticon.com)
- UI 디자인 영감: Music Player Apps (Spotify, Apple Music)
