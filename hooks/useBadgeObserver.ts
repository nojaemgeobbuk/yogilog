import { useEffect, useRef, useCallback } from 'react';
import { Q } from '@nozbe/watermelondb';
import * as Haptics from 'expo-haptics';
import { useYogaStore } from '@/store/useYogaStore';
import {
  practiceLogsCollection,
  practiceLogAsanasCollection,
  PracticeLog,
  PracticeLogAsana,
} from '@/database';
import { checkAchievementsFromPracticeLogs } from '@/utils/achievements';

/**
 * WatermelonDB의 practice_logs 변경을 감지하여
 * 배지 획득 조건을 자동으로 체크하는 Observer Hook
 */
export function useBadgeObserver() {
  const unlockedBadgeIds = useYogaStore((state) => state.unlockedBadgeIds);
  const setUnlockedBadgeIds = useYogaStore.setState;

  // 이전 practice log 수를 저장하여 변화 감지
  const previousCountRef = useRef<number>(0);
  const isInitializedRef = useRef<boolean>(false);

  // 배지 잠금 해제 함수
  const unlockNewBadges = useCallback(async (
    practiceLogs: PracticeLog[],
    practiceLogAsanas: PracticeLogAsana[]
  ) => {
    const currentUnlocked = useYogaStore.getState().unlockedBadgeIds;
    const newBadgeIds = checkAchievementsFromPracticeLogs(
      practiceLogs,
      practiceLogAsanas,
      currentUnlocked
    );

    if (newBadgeIds.length > 0) {
      console.log('[BadgeObserver] New badges unlocked:', newBadgeIds);

      // Haptic feedback - 진동으로 배지 획득 알림
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {
        console.log('[BadgeObserver] Haptics not available');
      }

      // Zustand store 업데이트
      setUnlockedBadgeIds((state) => ({
        unlockedBadgeIds: [...state.unlockedBadgeIds, ...newBadgeIds],
        newlyUnlockedBadgeIds: [...state.newlyUnlockedBadgeIds, ...newBadgeIds],
      }));
    }
  }, [setUnlockedBadgeIds]);

  useEffect(() => {
    // WatermelonDB Observable 구독
    const practiceLogsSubscription = practiceLogsCollection
      .query(Q.sortBy('date', Q.desc))
      .observe()
      .subscribe(async (logs) => {
        // 초기화 시에는 변경 감지만 설정
        if (!isInitializedRef.current) {
          previousCountRef.current = logs.length;
          isInitializedRef.current = true;
          console.log('[BadgeObserver] Initialized with', logs.length, 'logs');

          // 초기 로드 시에도 배지 체크 (이전에 놓친 배지가 있을 수 있음)
          const asanas = await practiceLogAsanasCollection.query().fetch();
          await unlockNewBadges(logs, asanas);
          return;
        }

        // 데이터가 변경되었을 때만 배지 체크
        if (logs.length !== previousCountRef.current) {
          console.log('[BadgeObserver] Practice logs changed:', previousCountRef.current, '->', logs.length);
          previousCountRef.current = logs.length;

          // 아사나 데이터도 가져와서 배지 체크
          const asanas = await practiceLogAsanasCollection.query().fetch();
          await unlockNewBadges(logs, asanas);
        }
      });

    // Cleanup
    return () => {
      practiceLogsSubscription.unsubscribe();
    };
  }, [unlockNewBadges]);
}

/**
 * 배지 획득 시 햅틱 피드백을 주는 유틸 함수
 */
export async function triggerBadgeHaptic() {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (e) {
    console.log('[BadgeObserver] Haptics not available');
  }
}
