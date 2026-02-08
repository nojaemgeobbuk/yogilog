import { YogaSession } from "@/types";
import { BADGE_DB, Badge, BadgeCondition } from "@/constants/Badges";
import type { PracticeLog, PracticeLogAsana } from "@/database";

interface AchievementStats {
  totalSessions: number;
  totalMinutes: number;
  streakDays: number;
  uniqueAsanas: Set<string>;
  asanaCountMap: Map<string, number>;
  highIntensitySessions: number;
  earlyBirdSessions: number;
  nightOwlSessions: number;
  longSessions: number;
  favoriteCount: number;
}

// ============================================================
// 상수 정의
// ============================================================

const EARLY_BIRD_START = 6;
const EARLY_BIRD_END = 9;
const NIGHT_OWL_START = 20;
const NIGHT_OWL_END = 23;
const LONG_SESSION_THRESHOLD = 60; // 분
const HIGH_INTENSITY_THRESHOLD = 4;

// ============================================================
// 공통 유틸리티 함수
// ============================================================

/**
 * 날짜 문자열 배열에서 고유한 날짜 Set 생성
 */
const getUniqueDateStrings = (dates: string[]): Set<string> => {
  return new Set(dates.map((d) => new Date(d).toDateString()));
};

/**
 * 날짜 Set에서 현재 진행 중인 연속일 계산
 */
const calculateStreakFromDates = (sessionDates: Set<string>): number => {
  if (sessionDates.size === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const hasTodaySession = sessionDates.has(today.toDateString());
  const hasYesterdaySession = sessionDates.has(yesterday.toDateString());

  if (!hasTodaySession && !hasYesterdaySession) return 0;

  let currentDate = hasTodaySession ? today : yesterday;
  let streak = 0;

  while (sessionDates.has(currentDate.toDateString())) {
    streak++;
    currentDate = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
};

/**
 * 날짜 Set에서 최대 연속일 계산
 */
const calculateMaxStreakFromDates = (sessionDates: Set<string>): number => {
  if (sessionDates.size === 0) return 0;

  const sortedDates = Array.from(sessionDates)
    .map((d) => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime());

  let streak = 1;
  let maxStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const diff =
      (sortedDates[i - 1].getTime() - sortedDates[i].getTime()) /
      (1000 * 60 * 60 * 24);

    if (diff === 1) {
      streak++;
      maxStreak = Math.max(maxStreak, streak);
    } else {
      streak = 1;
    }
  }

  return maxStreak;
};

/**
 * 특정 배지 조건 충족 여부 확인
 */
const checkCondition = (
  condition: BadgeCondition,
  stats: AchievementStats
): boolean => {
  switch (condition.type) {
    case "total_sessions":
      return stats.totalSessions >= condition.value;
    case "total_minutes":
      return stats.totalMinutes >= condition.value;
    case "streak_days":
      return stats.streakDays >= condition.value;
    case "asana_count":
      return stats.uniqueAsanas.size >= condition.value;
    case "specific_asana":
      if (!condition.asanaName) return false;
      let count = 0;
      stats.asanaCountMap.forEach((value, key) => {
        if (key.toLowerCase().includes(condition.asanaName!.toLowerCase())) {
          count += value;
        }
      });
      return count >= condition.value;
    case "high_intensity":
      return stats.highIntensitySessions >= condition.value;
    case "early_bird":
      return stats.earlyBirdSessions >= condition.value;
    case "night_owl":
      return stats.nightOwlSessions >= condition.value;
    case "long_session":
      return stats.longSessions >= condition.value;
    case "favorite_count":
      return stats.favoriteCount >= condition.value;
    default:
      return false;
  }
};

/**
 * 배지 조건의 현재 진행 값 계산
 */
const getCurrentProgress = (
  condition: BadgeCondition,
  stats: AchievementStats
): number => {
  switch (condition.type) {
    case "total_sessions":
      return stats.totalSessions;
    case "total_minutes":
      return stats.totalMinutes;
    case "streak_days":
      return stats.streakDays;
    case "asana_count":
      return stats.uniqueAsanas.size;
    case "specific_asana":
      if (!condition.asanaName) return 0;
      let count = 0;
      stats.asanaCountMap.forEach((value, key) => {
        if (key.toLowerCase().includes(condition.asanaName!.toLowerCase())) {
          count += value;
        }
      });
      return count;
    case "high_intensity":
      return stats.highIntensitySessions;
    case "early_bird":
      return stats.earlyBirdSessions;
    case "night_owl":
      return stats.nightOwlSessions;
    case "long_session":
      return stats.longSessions;
    case "favorite_count":
      return stats.favoriteCount;
    default:
      return 0;
  }
};

// ============================================================
// 세션 데이터 인터페이스 (공통 추상화)
// ============================================================

interface SessionData {
  date: string;
  duration: number;
  intensity: number;
  isFavorite: boolean;
}

interface AsanaData {
  name: string;
}

/**
 * YogaSession을 공통 인터페이스로 변환
 */
const convertYogaSession = (session: YogaSession): { session: SessionData; asanas: AsanaData[] } => ({
  session: {
    date: session.date,
    duration: session.duration,
    intensity: session.intensity,
    isFavorite: session.isFavorite,
  },
  asanas: session.asanas.map((a) => ({ name: a.name })),
});

/**
 * PracticeLog를 공통 인터페이스로 변환
 */
const convertPracticeLog = (log: PracticeLog): SessionData => ({
  date: log.date,
  duration: log.duration,
  intensity: log.intensity,
  isFavorite: log.isFavorite,
});

/**
 * PracticeLogAsana를 공통 인터페이스로 변환
 */
const convertPracticeLogAsana = (asana: PracticeLogAsana): AsanaData => ({
  name: asana.asanaName,
});

// ============================================================
// 통합 통계 계산 함수
// ============================================================

/**
 * 세션 및 아사나 데이터로부터 통계 계산 (공통)
 */
const calculateStatsInternal = (
  sessions: SessionData[],
  asanas: AsanaData[]
): AchievementStats => {
  const uniqueAsanas = new Set<string>();
  const asanaCountMap = new Map<string, number>();

  let totalMinutes = 0;
  let highIntensitySessions = 0;
  let earlyBirdSessions = 0;
  let nightOwlSessions = 0;
  let longSessions = 0;
  let favoriteCount = 0;

  const dates: string[] = [];

  sessions.forEach((session) => {
    dates.push(session.date);
    totalMinutes += session.duration;

    if (session.intensity >= HIGH_INTENSITY_THRESHOLD) {
      highIntensitySessions++;
    }

    const hour = new Date(session.date).getHours();
    if (hour >= EARLY_BIRD_START && hour < EARLY_BIRD_END) {
      earlyBirdSessions++;
    }
    if (hour >= NIGHT_OWL_START && hour < NIGHT_OWL_END) {
      nightOwlSessions++;
    }

    if (session.duration >= LONG_SESSION_THRESHOLD) {
      longSessions++;
    }

    if (session.isFavorite) {
      favoriteCount++;
    }
  });

  asanas.forEach((asana) => {
    uniqueAsanas.add(asana.name);
    asanaCountMap.set(asana.name, (asanaCountMap.get(asana.name) || 0) + 1);
  });

  const sessionDates = getUniqueDateStrings(dates);

  return {
    totalSessions: sessions.length,
    totalMinutes,
    streakDays: calculateMaxStreakFromDates(sessionDates),
    uniqueAsanas,
    asanaCountMap,
    highIntensitySessions,
    earlyBirdSessions,
    nightOwlSessions,
    longSessions,
    favoriteCount,
  };
};

// ============================================================
// YogaSession 기반 함수 (레거시 호환)
// ============================================================

/**
 * 현재 진행 중인 연속 수련일 계산
 */
export const calculateCurrentStreak = (sessions: YogaSession[]): number => {
  const dates = sessions.map((s) => s.date);
  const sessionDates = getUniqueDateStrings(dates);
  return calculateStreakFromDates(sessionDates);
};

/**
 * 세션 데이터로부터 통계 계산
 */
export const calculateStats = (sessions: YogaSession[]): AchievementStats => {
  const sessionData = sessions.map((s) => convertYogaSession(s).session);
  const asanaData = sessions.flatMap((s) => s.asanas.map((a) => ({ name: a.name })));
  return calculateStatsInternal(sessionData, asanaData);
};

/**
 * 새로 획득 가능한 배지 확인
 */
export const checkAchievements = (
  sessions: YogaSession[],
  unlockedBadgeIds: string[]
): string[] => {
  const stats = calculateStats(sessions);
  return BADGE_DB
    .filter((badge) => !unlockedBadgeIds.includes(badge.id))
    .filter((badge) => checkCondition(badge.condition, stats))
    .map((badge) => badge.id);
};

/**
 * 배지 진행률 계산 (0-100%)
 */
export const getBadgeProgress = (
  badge: Badge,
  sessions: YogaSession[]
): number => {
  const stats = calculateStats(sessions);
  const current = getCurrentProgress(badge.condition, stats);
  return Math.min(100, Math.round((current / badge.condition.value) * 100));
};

// ============================================================
// PracticeLog 기반 함수 (WatermelonDB)
// ============================================================

/**
 * PracticeLog 배열에서 현재 진행 중인 연속 수련일 계산
 */
export const calculateCurrentStreakFromPracticeLogs = (practiceLogs: PracticeLog[]): number => {
  const dates = practiceLogs.map((s) => s.date);
  const sessionDates = getUniqueDateStrings(dates);
  return calculateStreakFromDates(sessionDates);
};

/**
 * PracticeLog/PracticeLogAsana에서 통계 계산
 */
export const calculateStatsFromPracticeLogs = (
  practiceLogs: PracticeLog[],
  practiceLogAsanas: PracticeLogAsana[]
): AchievementStats => {
  const sessionData = practiceLogs.map(convertPracticeLog);
  const asanaData = practiceLogAsanas.map(convertPracticeLogAsana);
  return calculateStatsInternal(sessionData, asanaData);
};

/**
 * PracticeLog 기반 배지 진행률 계산
 */
export const getBadgeProgressFromPracticeLogs = (
  badge: Badge,
  practiceLogs: PracticeLog[],
  practiceLogAsanas: PracticeLogAsana[]
): number => {
  const stats = calculateStatsFromPracticeLogs(practiceLogs, practiceLogAsanas);
  const current = getCurrentProgress(badge.condition, stats);
  return Math.min(100, Math.round((current / badge.condition.value) * 100));
};

/**
 * PracticeLog 기반 새로 획득 가능한 배지 확인
 */
export const checkAchievementsFromPracticeLogs = (
  practiceLogs: PracticeLog[],
  practiceLogAsanas: PracticeLogAsana[],
  unlockedBadgeIds: string[]
): string[] => {
  const stats = calculateStatsFromPracticeLogs(practiceLogs, practiceLogAsanas);
  return BADGE_DB
    .filter((badge) => !unlockedBadgeIds.includes(badge.id))
    .filter((badge) => checkCondition(badge.condition, stats))
    .map((badge) => badge.id);
};
