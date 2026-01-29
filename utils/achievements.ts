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

/**
 * 세션 날짜에서 시간을 추출 (0-23)
 */
const getSessionHour = (dateString: string): number => {
  const date = new Date(dateString);
  return date.getHours();
};

/**
 * 최대 연속 수련일 계산
 */
const calculateMaxStreakDays = (sessions: YogaSession[]): number => {
  if (sessions.length === 0) return 0;

  // 날짜별로 세션 그룹화 (날짜만 추출)
  const sessionDates = new Set(
    sessions.map((s) => new Date(s.date).toDateString())
  );

  const sortedDates = Array.from(sessionDates)
    .map((d) => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime()); // 최신순 정렬

  if (sortedDates.length === 0) return 0;

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
 * 현재 진행 중인 연속 수련일 계산 (오늘/어제부터 역산)
 */
export const calculateCurrentStreak = (sessions: YogaSession[]): number => {
  if (sessions.length === 0) return 0;

  // 날짜별로 세션 그룹화 (날짜만 추출)
  const sessionDates = new Set(
    sessions.map((s) => new Date(s.date).toDateString())
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // 오늘이나 어제 수련하지 않았으면 streak은 0
  const hasTodaySession = sessionDates.has(today.toDateString());
  const hasYesterdaySession = sessionDates.has(yesterday.toDateString());

  if (!hasTodaySession && !hasYesterdaySession) return 0;

  // 시작 날짜 결정 (오늘 또는 어제)
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
 * 세션 데이터로부터 통계 계산
 */
export const calculateStats = (sessions: YogaSession[]): AchievementStats => {
  const uniqueAsanas = new Set<string>();
  const asanaCountMap = new Map<string, number>();

  let totalMinutes = 0;
  let highIntensitySessions = 0;
  let earlyBirdSessions = 0;
  let nightOwlSessions = 0;
  let longSessions = 0;
  let favoriteCount = 0;

  sessions.forEach((session) => {
    // 총 수련 시간
    totalMinutes += session.duration;

    // 고강도 세션
    if (session.intensity >= 4) {
      highIntensitySessions++;
    }

    // 시간대별 세션
    const hour = getSessionHour(session.date);
    if (hour >= 6 && hour < 9) {
      earlyBirdSessions++;
    }
    if (hour >= 20 && hour < 23) {
      nightOwlSessions++;
    }

    // 장시간 세션
    if (session.duration >= 60) {
      longSessions++;
    }

    // 즐겨찾기
    if (session.isFavorite) {
      favoriteCount++;
    }

    // 아사나 통계
    session.asanas.forEach((asanaRecord) => {
      const asanaName = asanaRecord.name;
      uniqueAsanas.add(asanaName);
      asanaCountMap.set(asanaName, (asanaCountMap.get(asanaName) || 0) + 1);
    });
  });

  return {
    totalSessions: sessions.length,
    totalMinutes,
    streakDays: calculateMaxStreakDays(sessions),
    uniqueAsanas,
    asanaCountMap,
    highIntensitySessions,
    earlyBirdSessions,
    nightOwlSessions,
    longSessions,
    favoriteCount,
  };
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
      // 부분 일치 검색 (예: "Warrior"가 포함된 모든 아사나)
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
 * 새로 획득 가능한 배지 확인
 */
export const checkAchievements = (
  sessions: YogaSession[],
  unlockedBadgeIds: string[]
): string[] => {
  const stats = calculateStats(sessions);
  const newBadges: string[] = [];

  BADGE_DB.forEach((badge) => {
    // 이미 획득한 배지는 스킵
    if (unlockedBadgeIds.includes(badge.id)) return;

    // 조건 충족 확인
    if (checkCondition(badge.condition, stats)) {
      newBadges.push(badge.id);
    }
  });

  return newBadges;
};

/**
 * 배지 진행률 계산 (0-100%)
 */
export const getBadgeProgress = (
  badge: Badge,
  sessions: YogaSession[]
): number => {
  const stats = calculateStats(sessions);
  let current = 0;

  switch (badge.condition.type) {
    case "total_sessions":
      current = stats.totalSessions;
      break;
    case "total_minutes":
      current = stats.totalMinutes;
      break;
    case "streak_days":
      current = stats.streakDays;
      break;
    case "asana_count":
      current = stats.uniqueAsanas.size;
      break;
    case "specific_asana":
      if (badge.condition.asanaName) {
        stats.asanaCountMap.forEach((value, key) => {
          if (key.toLowerCase().includes(badge.condition.asanaName!.toLowerCase())) {
            current += value;
          }
        });
      }
      break;
    case "high_intensity":
      current = stats.highIntensitySessions;
      break;
    case "early_bird":
      current = stats.earlyBirdSessions;
      break;
    case "night_owl":
      current = stats.nightOwlSessions;
      break;
    case "long_session":
      current = stats.longSessions;
      break;
    case "favorite_count":
      current = stats.favoriteCount;
      break;
  }

  return Math.min(100, Math.round((current / badge.condition.value) * 100));
};

// ============================================================
// WatermelonDB PracticeLog 호환 함수들
// ============================================================

/**
 * PracticeLog 배열에서 현재 진행 중인 연속 수련일 계산
 */
export const calculateCurrentStreakFromPracticeLogs = (practiceLogs: PracticeLog[]): number => {
  if (practiceLogs.length === 0) return 0;

  // 날짜별로 세션 그룹화 (날짜만 추출)
  const sessionDates = new Set(
    practiceLogs.map((s) => new Date(s.date).toDateString())
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // 오늘이나 어제 수련하지 않았으면 streak은 0
  const hasTodaySession = sessionDates.has(today.toDateString());
  const hasYesterdaySession = sessionDates.has(yesterday.toDateString());

  if (!hasTodaySession && !hasYesterdaySession) return 0;

  // 시작 날짜 결정 (오늘 또는 어제)
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
 * PracticeLog 최대 연속 수련일 계산
 */
const calculateMaxStreakDaysFromPracticeLogs = (practiceLogs: PracticeLog[]): number => {
  if (practiceLogs.length === 0) return 0;

  const sessionDates = new Set(
    practiceLogs.map((s) => new Date(s.date).toDateString())
  );

  const sortedDates = Array.from(sessionDates)
    .map((d) => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime());

  if (sortedDates.length === 0) return 0;

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
 * PracticeLog/PracticeLogAsana에서 통계 계산
 */
const calculateStatsFromPracticeLogs = (
  practiceLogs: PracticeLog[],
  practiceLogAsanas: PracticeLogAsana[]
): AchievementStats => {
  const uniqueAsanas = new Set<string>();
  const asanaCountMap = new Map<string, number>();

  let totalMinutes = 0;
  let highIntensitySessions = 0;
  let earlyBirdSessions = 0;
  let nightOwlSessions = 0;
  let longSessions = 0;
  let favoriteCount = 0;

  practiceLogs.forEach((log) => {
    totalMinutes += log.duration;

    if (log.intensity >= 4) {
      highIntensitySessions++;
    }

    const hour = new Date(log.date).getHours();
    if (hour >= 6 && hour < 9) {
      earlyBirdSessions++;
    }
    if (hour >= 20 && hour < 23) {
      nightOwlSessions++;
    }

    if (log.duration >= 60) {
      longSessions++;
    }

    if (log.isFavorite) {
      favoriteCount++;
    }
  });

  // 아사나 통계
  practiceLogAsanas.forEach((asanaRecord) => {
    const asanaName = asanaRecord.asanaName;
    uniqueAsanas.add(asanaName);
    asanaCountMap.set(asanaName, (asanaCountMap.get(asanaName) || 0) + 1);
  });

  return {
    totalSessions: practiceLogs.length,
    totalMinutes,
    streakDays: calculateMaxStreakDaysFromPracticeLogs(practiceLogs),
    uniqueAsanas,
    asanaCountMap,
    highIntensitySessions,
    earlyBirdSessions,
    nightOwlSessions,
    longSessions,
    favoriteCount,
  };
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
  let current = 0;

  switch (badge.condition.type) {
    case "total_sessions":
      current = stats.totalSessions;
      break;
    case "total_minutes":
      current = stats.totalMinutes;
      break;
    case "streak_days":
      current = stats.streakDays;
      break;
    case "asana_count":
      current = stats.uniqueAsanas.size;
      break;
    case "specific_asana":
      if (badge.condition.asanaName) {
        stats.asanaCountMap.forEach((value, key) => {
          if (key.toLowerCase().includes(badge.condition.asanaName!.toLowerCase())) {
            current += value;
          }
        });
      }
      break;
    case "high_intensity":
      current = stats.highIntensitySessions;
      break;
    case "early_bird":
      current = stats.earlyBirdSessions;
      break;
    case "night_owl":
      current = stats.nightOwlSessions;
      break;
    case "long_session":
      current = stats.longSessions;
      break;
    case "favorite_count":
      current = stats.favoriteCount;
      break;
  }

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
  const newBadges: string[] = [];

  BADGE_DB.forEach((badge) => {
    if (unlockedBadgeIds.includes(badge.id)) return;

    if (checkCondition(badge.condition, stats)) {
      newBadges.push(badge.id);
    }
  });

  return newBadges;
};
