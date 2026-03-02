import type { PracticeLog } from "@/database";

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
 * PracticeLog 배열에서 현재 진행 중인 연속 수련일 계산
 */
export const calculateCurrentStreakFromPracticeLogs = (practiceLogs: PracticeLog[]): number => {
  const dates = practiceLogs.map((s) => s.date);
  const sessionDates = getUniqueDateStrings(dates);
  return calculateStreakFromDates(sessionDates);
};
