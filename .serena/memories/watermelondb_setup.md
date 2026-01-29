# WatermelonDB 설정

## 개요
로컬 전용 SQLite 기반 데이터베이스 (Local-First 아키텍처)

## 파일 구조

```
database/
├── index.ts                 # Database 인스턴스 + 컬렉션 export
├── schema.ts                # 스키마 정의 (version: 1)
├── DatabaseProvider.tsx     # React Context Provider
├── migration.ts             # AsyncStorage → WatermelonDB 마이그레이션
└── models/
    ├── index.ts
    ├── Asana.ts
    ├── Sequence.ts
    ├── SequenceAsana.ts
    ├── PracticeLog.ts
    ├── PracticeLogAsana.ts
    └── PracticeLogPhoto.ts

hooks/
├── index.ts
├── usePracticeLogs.ts       # 수련 기록 CRUD + observe
├── useSequences.ts          # 시퀀스 CRUD + observe
└── useAsanas.ts             # 아사나 즐겨찾기 관리
```

## 테이블 (6개)

| 테이블 | 설명 |
|--------|------|
| `asanas` | 아사나 마스터 데이터 + 즐겨찾기 |
| `sequences` | 사용자 저장 시퀀스 |
| `sequence_asanas` | 시퀀스-아사나 관계 |
| `practice_logs` | 수련 기록 (기존 YogaSession) |
| `practice_log_asanas` | 세션별 아사나 기록 |
| `practice_log_photos` | 세션별 사진 |

## 주요 훅

### usePracticeLogs
- `createPracticeLog(input)` - 수련 기록 생성
- `updatePracticeLog(id, input)` - 수정
- `deletePracticeLog(id)` - 삭제
- `toggleFavorite(id)` - 즐겨찾기 토글
- `observePracticeLogs()` - 전체 목록 observe
- `observeFavoritePracticeLogs()` - 즐겨찾기만 observe

### useSequences
- `createSequence(input)` - 시퀀스 생성
- `updateSequence(id, input)` - 수정
- `deleteSequence(id)` - 삭제
- `observeSequences()` - 전체 목록 observe

### useAsanas
- `toggleFavorite(englishName)` - 즐겨찾기 토글
- `observeFavoriteAsanas()` - 즐겨찾기 목록 observe

## 마이그레이션

- `_layout.tsx`에서 앱 시작 시 자동 실행
- AsyncStorage 키: `yogilog-storage`, `yogilog-sequences`
- 마이그레이션 완료 키: `watermelondb_migration_v1_completed`

## 현재 상태

- [x] 스키마 및 모델 정의
- [x] Database 초기화 및 Provider
- [x] 커스텀 훅 구현
- [x] 마이그레이션 스크립트
- [x] _layout.tsx에 Provider 추가
- [x] 기존 컴포넌트를 새 훅으로 점진적 교체 (완료)

## Observable 패턴 적용 완료

### index.tsx (홈 화면)
- `withObservables`로 `practice_logs` 컬렉션 observe
- 개별 아이템의 관계 데이터(photos, asanas) observe
- `React.memo`로 불필요한 리렌더링 방지

### session/[id].tsx (상세 화면)
- `withObservables`로 practiceLog + 관계 데이터 observe
- RxJS `switchMap`으로 실시간 업데이트 지원
- 로딩/에러 상태 처리 개선

### AsanaInput.tsx (아사나 선택)
- 즐겨찾기: `observeFavoriteAsanas()` - WatermelonDB observe
- 시퀀스: `observeSequences()` - WatermelonDB observe
- `toggleFavorite`: `useAsanas().toggleFavorite` 사용
- `deleteSequence`: `useSequences().deleteSequence` 사용
- `currentBuildingAsanas`는 여전히 Zustand 스토어 유지 (메모리 상태)

## 참고

- 배지 시스템은 아직 기존 AsyncStorage 유지
- `currentBuildingAsanas`는 React useState로 유지 (DB 저장 안 함)
