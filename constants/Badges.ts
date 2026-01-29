import {
  Award,
  Flame,
  Clock,
  Target,
  Zap,
  Sun,
  Moon,
  Heart,
  Trophy,
  Star,
  Crown,
  Sparkles,
  Mountain,
  Leaf,
  Timer,
  Calendar,
  TrendingUp,
  Medal,
  type LucideIcon,
} from "lucide-react-native";

// 배지 달성 조건 타입
export type BadgeConditionType =
  | "total_sessions"      // 누적 세션 횟수
  | "total_minutes"       // 누적 수련 시간(분)
  | "streak_days"         // 연속 수련일
  | "asana_count"         // 특정 아사나 수행 횟수
  | "specific_asana"      // 특정 아사나 포함 여부
  | "high_intensity"      // 고강도 세션 횟수 (intensity >= 4)
  | "early_bird"          // 아침 수련 횟수 (6-9시)
  | "night_owl"           // 저녁 수련 횟수 (20-23시)
  | "long_session"        // 장시간 세션 횟수 (60분 이상)
  | "favorite_count";     // 즐겨찾기 세션 수

export interface BadgeCondition {
  type: BadgeConditionType;
  value: number;
  asanaName?: string; // specific_asana 조건용
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  condition: BadgeCondition;
  tier: "bronze" | "silver" | "gold" | "platinum";
}

export const BADGE_DB: Badge[] = [
  // === 누적 세션 횟수 배지 ===
  {
    id: "first_step",
    title: "첫 발걸음",
    description: "첫 번째 요가 세션을 완료했습니다!",
    icon: Star,
    color: "#FFD700",
    condition: { type: "total_sessions", value: 1 },
    tier: "bronze",
  },
  {
    id: "getting_started",
    title: "시작이 반",
    description: "10회 세션을 달성했습니다!",
    icon: Flame,
    color: "#FF6B6B",
    condition: { type: "total_sessions", value: 10 },
    tier: "bronze",
  },
  {
    id: "dedicated_yogi",
    title: "열정적인 요기",
    description: "50회 세션을 달성했습니다!",
    icon: Heart,
    color: "#FF4757",
    condition: { type: "total_sessions", value: 50 },
    tier: "silver",
  },
  {
    id: "century_club",
    title: "센추리 클럽",
    description: "100회 세션을 달성했습니다!",
    icon: Trophy,
    color: "#FFD700",
    condition: { type: "total_sessions", value: 100 },
    tier: "gold",
  },
  {
    id: "yoga_master",
    title: "요가 마스터",
    description: "500회 세션을 달성했습니다!",
    icon: Crown,
    color: "#9B59B6",
    condition: { type: "total_sessions", value: 500 },
    tier: "platinum",
  },

  // === 누적 수련 시간 배지 ===
  {
    id: "time_keeper_1",
    title: "시간의 수호자 I",
    description: "총 1시간 수련을 달성했습니다!",
    icon: Clock,
    color: "#3498DB",
    condition: { type: "total_minutes", value: 60 },
    tier: "bronze",
  },
  {
    id: "time_keeper_2",
    title: "시간의 수호자 II",
    description: "총 10시간 수련을 달성했습니다!",
    icon: Timer,
    color: "#2980B9",
    condition: { type: "total_minutes", value: 600 },
    tier: "silver",
  },
  {
    id: "time_keeper_3",
    title: "시간의 수호자 III",
    description: "총 50시간 수련을 달성했습니다!",
    icon: Clock,
    color: "#1ABC9C",
    condition: { type: "total_minutes", value: 3000 },
    tier: "gold",
  },
  {
    id: "time_master",
    title: "시간의 지배자",
    description: "총 100시간 수련을 달성했습니다!",
    icon: Sparkles,
    color: "#E74C3C",
    condition: { type: "total_minutes", value: 6000 },
    tier: "platinum",
  },

  // === 연속 수련일 배지 ===
  {
    id: "streak_3",
    title: "3일 연속",
    description: "3일 연속 수련을 달성했습니다!",
    icon: Zap,
    color: "#F39C12",
    condition: { type: "streak_days", value: 3 },
    tier: "bronze",
  },
  {
    id: "streak_7",
    title: "일주일 전사",
    description: "7일 연속 수련을 달성했습니다!",
    icon: Flame,
    color: "#E67E22",
    condition: { type: "streak_days", value: 7 },
    tier: "silver",
  },
  {
    id: "streak_30",
    title: "한 달의 기적",
    description: "30일 연속 수련을 달성했습니다!",
    icon: Calendar,
    color: "#D35400",
    condition: { type: "streak_days", value: 30 },
    tier: "gold",
  },
  {
    id: "streak_100",
    title: "불멸의 요기",
    description: "100일 연속 수련을 달성했습니다!",
    icon: TrendingUp,
    color: "#C0392B",
    condition: { type: "streak_days", value: 100 },
    tier: "platinum",
  },

  // === 특정 아사나 배지 ===
  {
    id: "warrior_spirit",
    title: "전사의 정신",
    description: "Warrior 시리즈를 10회 수행했습니다!",
    icon: Target,
    color: "#8E44AD",
    condition: { type: "specific_asana", value: 10, asanaName: "Warrior" },
    tier: "silver",
  },
  {
    id: "sun_salutation_master",
    title: "태양 예배 마스터",
    description: "Sun Salutation을 20회 수행했습니다!",
    icon: Sun,
    color: "#F1C40F",
    condition: { type: "specific_asana", value: 20, asanaName: "Sun Salutation" },
    tier: "gold",
  },
  {
    id: "tree_hugger",
    title: "나무의 친구",
    description: "Tree Pose를 15회 수행했습니다!",
    icon: Leaf,
    color: "#27AE60",
    condition: { type: "specific_asana", value: 15, asanaName: "Tree" },
    tier: "silver",
  },
  {
    id: "mountain_climber",
    title: "산악인",
    description: "Mountain Pose를 30회 수행했습니다!",
    icon: Mountain,
    color: "#7F8C8D",
    condition: { type: "specific_asana", value: 30, asanaName: "Mountain" },
    tier: "silver",
  },

  // === 고강도 세션 배지 ===
  {
    id: "power_yogi",
    title: "파워 요기",
    description: "고강도(4 이상) 세션을 10회 완료했습니다!",
    icon: Zap,
    color: "#E74C3C",
    condition: { type: "high_intensity", value: 10 },
    tier: "silver",
  },
  {
    id: "intensity_master",
    title: "강도의 달인",
    description: "고강도(4 이상) 세션을 50회 완료했습니다!",
    icon: Flame,
    color: "#C0392B",
    condition: { type: "high_intensity", value: 50 },
    tier: "gold",
  },

  // === 시간대별 수련 배지 ===
  {
    id: "early_bird",
    title: "얼리버드",
    description: "아침(6-9시) 수련을 10회 완료했습니다!",
    icon: Sun,
    color: "#F39C12",
    condition: { type: "early_bird", value: 10 },
    tier: "silver",
  },
  {
    id: "night_owl",
    title: "올빼미",
    description: "저녁(20-23시) 수련을 10회 완료했습니다!",
    icon: Moon,
    color: "#34495E",
    condition: { type: "night_owl", value: 10 },
    tier: "silver",
  },

  // === 장시간 세션 배지 ===
  {
    id: "marathon_yogi",
    title: "마라톤 요기",
    description: "60분 이상 세션을 5회 완료했습니다!",
    icon: Medal,
    color: "#9B59B6",
    condition: { type: "long_session", value: 5 },
    tier: "silver",
  },
  {
    id: "endurance_master",
    title: "지구력의 달인",
    description: "60분 이상 세션을 20회 완료했습니다!",
    icon: Award,
    color: "#8E44AD",
    condition: { type: "long_session", value: 20 },
    tier: "gold",
  },

  // === 즐겨찾기 배지 ===
  {
    id: "collector",
    title: "컬렉터",
    description: "10개의 세션을 즐겨찾기에 추가했습니다!",
    icon: Star,
    color: "#FFD700",
    condition: { type: "favorite_count", value: 10 },
    tier: "silver",
  },

  // === 다양한 아사나 배지 ===
  {
    id: "variety_seeker",
    title: "다양성 추구자",
    description: "20가지 다른 아사나를 수행했습니다!",
    icon: Sparkles,
    color: "#1ABC9C",
    condition: { type: "asana_count", value: 20 },
    tier: "silver",
  },
  {
    id: "asana_encyclopedia",
    title: "아사나 백과사전",
    description: "50가지 다른 아사나를 수행했습니다!",
    icon: Award,
    color: "#16A085",
    condition: { type: "asana_count", value: 50 },
    tier: "gold",
  },
];

// 티어별 색상 테마
export const TIER_COLORS = {
  bronze: {
    background: "#CD7F32",
    border: "#A0522D",
    text: "#FFFFFF",
  },
  silver: {
    background: "#C0C0C0",
    border: "#A8A8A8",
    text: "#333333",
  },
  gold: {
    background: "#FFD700",
    border: "#DAA520",
    text: "#333333",
  },
  platinum: {
    background: "#E5E4E2",
    border: "#B0B0B0",
    text: "#333333",
    gradient: ["#E5E4E2", "#A0A0A0", "#E5E4E2"],
  },
};

export const getBadgeById = (id: string): Badge | undefined => {
  return BADGE_DB.find((badge) => badge.id === id);
};
