import { Colors } from "@/constants/Colors";

// 아사나 개별 기록 인터페이스
export interface AsanaRecord {
  asanaId: string;      // 고유 ID (UUID)
  name: string;         // 아사나 이름 (산스크리트 또는 영어)
  note: string;         // 개별 노트
  status?: "mastered" | "practicing" | "learning" | "attempted";  // 수련 상태
}

export interface YogaSession {
  id: string;
  title: string;
  images: string[];
  note: string;
  date: string;
  duration: number;
  intensity: number;
  hashtags: string[];
  asanas: AsanaRecord[];  // string[] → AsanaRecord[]로 변경
  isFavorite: boolean;
}

export interface YogaStore {
  sessions: YogaSession[];
  unlockedBadgeIds: string[];
  newlyUnlockedBadgeIds: string[]; // 새로 획득한 배지 (축하 모달용)
  _hasHydrated: boolean;
  addSession: (session: Omit<YogaSession, "id" | "isFavorite">) => void;
  updateSession: (id: string, session: Partial<YogaSession>) => void;
  deleteSession: (id: string) => void;
  getSession: (id: string) => YogaSession | undefined;
  toggleFavorite: (id: string) => void;
  unlockBadge: (badgeId: string) => void;
  clearNewlyUnlockedBadges: () => void;
  checkAndUnlockBadges: () => string[]; // 새로 획득한 배지 ID 반환
}

// 아사나 상태 라벨 및 색상 매핑 (The Layered Minimal palette)
export const ASANA_STATUS_CONFIG = {
  mastered: { label: "마스터", color: "#FFFFFF", bgColor: Colors.primary },       // Primary (Apricot)
  practicing: { label: "연습 중", color: Colors.text, bgColor: Colors.accent1 },  // Accent 1 (Muted Teal)
  learning: { label: "배우는 중", color: Colors.text, bgColor: Colors.secondary }, // Secondary (Light Beige)
  attempted: { label: "시도함", color: Colors.textMuted, bgColor: Colors.borderLight }, // Light gray
} as const;

export type AsanaStatus = keyof typeof ASANA_STATUS_CONFIG;

// ==================== 시퀀스 관련 타입 ====================

// 시퀀스 내 아사나 아이템 (순서 관리용 고유 ID 포함)
export interface SequenceAsanaItem {
  itemId: string;         // 시퀀스 내 고유 ID (순서 변경용)
  asanaName: string;      // 아사나 영어 이름
}

// 저장된 시퀀스
export interface UserSequence {
  id: string;             // 시퀀스 고유 ID
  name: string;           // 시퀀스 이름
  asanas: SequenceAsanaItem[];  // 아사나 목록
  createdAt: string;      // 생성일
  updatedAt: string;      // 수정일
}

// 시퀀스 빌더 스토어 인터페이스
export interface SequenceBuilderStore {
  // 현재 제작 중인 시퀀스
  currentBuildingAsanas: SequenceAsanaItem[];

  // 저장된 시퀀스 목록
  savedSequences: UserSequence[];

  // 즐겨찾기 아사나 목록
  favoriteAsanas: string[];

  // Hydration 상태
  _hasHydrated: boolean;

  // 현재 시퀀스 빌더 액션
  addAsana: (asanaName: string) => void;
  removeAsana: (itemId: string) => void;
  reorderAsanas: (asanas: SequenceAsanaItem[]) => void;
  clearCurrentBuild: () => void;

  // 시퀀스 저장/관리 액션
  saveSequence: (name: string) => UserSequence;
  deleteSequence: (sequenceId: string) => void;
  updateSequence: (sequenceId: string, updates: Partial<Pick<UserSequence, 'name' | 'asanas'>>) => void;

  // 시퀀스 불러오기 (현재 빌더에 로드)
  loadSequenceToBuilder: (sequenceId: string) => void;

  // 즐겨찾기 액션
  toggleFavoriteAsana: (asanaName: string) => void;
  isFavoriteAsana: (asanaName: string) => boolean;
}
