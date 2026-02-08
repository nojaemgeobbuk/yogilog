import { useState, useMemo, memo, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import { Trophy, Flame, Clock, Target, Lock, ChevronRight, Settings } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Q } from "@nozbe/watermelondb";
import withObservables from "@nozbe/with-observables";
import { useYogaStore } from "@/store/useYogaStore";
import { Colors } from "@/constants/Colors";
import { BADGE_DB, TIER_COLORS, Badge } from "@/constants/Badges";
import { getBadgeProgressFromPracticeLogs, calculateCurrentStreakFromPracticeLogs } from "@/utils/achievements";
import {
  practiceLogsCollection,
  practiceLogAsanasCollection,
  PracticeLog,
  PracticeLogAsana,
} from "@/database";

// 배지 아이콘에 Pop 애니메이션을 적용하는 컴포넌트
interface AnimatedBadgeIconProps {
  badge: Badge;
  unlocked: boolean;
  wasJustUnlocked: boolean;
  onPress: () => void;
}

const AnimatedBadgeIcon = memo(({
  badge,
  unlocked,
  wasJustUnlocked,
  onPress,
}: AnimatedBadgeIconProps) => {
  const scale = useSharedValue(1);
  const BadgeIcon = badge.icon;

  useEffect(() => {
    if (wasJustUnlocked) {
      // Pop 애니메이션 (0.8 → 1.2 → 1.0)
      scale.value = withSequence(
        withSpring(0.8, { damping: 8, stiffness: 100 }),
        withSpring(1.2, { damping: 6, stiffness: 180 }),
        withSpring(1, { damping: 10, stiffness: 120 })
      );
    }
  }, [wasJustUnlocked, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable onPress={onPress} style={[
      styles.badgeItem,
      unlocked ? styles.badgeUnlocked : styles.badgeLocked,
    ]}>
      <Animated.View style={[
        styles.badgeIconContainer,
        {
          backgroundColor: unlocked
            ? Colors.primary + "20"
            : Colors.background,
          borderColor: unlocked ? Colors.primary : Colors.border,
          borderWidth: unlocked ? 2 : 1,
          borderStyle: unlocked ? "solid" : "dashed",
        },
        animatedStyle,
      ]}>
        {unlocked ? (
          <BadgeIcon size={24} color={Colors.primary} />
        ) : (
          <Lock size={20} color={Colors.textMuted} />
        )}
      </Animated.View>
      <Text
        style={[
          styles.badgeTitle,
          { color: unlocked ? Colors.text : Colors.textMuted },
        ]}
        numberOfLines={2}
      >
        {badge.title}
      </Text>
    </Pressable>
  );
});

interface AchievementsScreenContentProps {
  practiceLogs: PracticeLog[];
  practiceLogAsanas: PracticeLogAsana[];
}

const AchievementsScreenContent = memo(({
  practiceLogs,
  practiceLogAsanas,
}: AchievementsScreenContentProps) => {
  const router = useRouter();
  // 배지 시스템은 Zustand에서 유지
  const unlockedBadgeIds = useYogaStore((state) => state.unlockedBadgeIds);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [showAllBadgesModal, setShowAllBadgesModal] = useState(false);

  // 새로 해제된 배지 추적 (Pop 애니메이션용)
  const previousUnlockedRef = useRef<Set<string>>(new Set(unlockedBadgeIds));
  const [newlyUnlockedIds, setNewlyUnlockedIds] = useState<Set<string>>(new Set());

  // 새로 해제된 배지 감지
  useEffect(() => {
    const previousSet = previousUnlockedRef.current;
    const currentSet = new Set(unlockedBadgeIds);

    // 새로 추가된 배지 찾기
    const newBadges = unlockedBadgeIds.filter((id) => !previousSet.has(id));

    let timeoutId: NodeJS.Timeout | null = null;

    if (newBadges.length > 0) {
      setNewlyUnlockedIds(new Set(newBadges));

      // 3초 후 새로 해제된 배지 상태 초기화
      timeoutId = setTimeout(() => {
        setNewlyUnlockedIds(new Set());
      }, 3000);
    }

    previousUnlockedRef.current = currentSet;

    // Cleanup: 컴포넌트 언마운트 시 타이머 정리
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [unlockedBadgeIds]);

  // 통계 계산
  const stats = useMemo(() => {
    const totalMinutes = practiceLogs.reduce((sum, s) => sum + s.duration, 0);
    const totalHours = totalMinutes / 60;

    // 총 아사나 개수
    const totalAsanas = practiceLogAsanas.length;

    // 이번 달 세션 수
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthlySessionCount = practiceLogs.filter((s) => {
      const sessionDate = new Date(s.date);
      return (
        sessionDate.getMonth() === currentMonth &&
        sessionDate.getFullYear() === currentYear
      );
    }).length;

    // 현재 진행 중인 스트릭
    const currentStreak = calculateCurrentStreakFromPracticeLogs(practiceLogs);

    return {
      totalHours,
      totalAsanas,
      monthlySessionCount,
      currentStreak,
    };
  }, [practiceLogs, practiceLogAsanas]);

  // 최근 배지 6개 (획득한 배지 우선, 나머지는 미획득)
  const recentBadges = useMemo(() => {
    const unlocked = BADGE_DB.filter((b) => unlockedBadgeIds.includes(b.id));
    const locked = BADGE_DB.filter((b) => !unlockedBadgeIds.includes(b.id));
    return [...unlocked, ...locked].slice(0, 6);
  }, [unlockedBadgeIds]);

  const handleBadgePress = (badge: Badge) => {
    setSelectedBadge(badge);
    setShowBadgeModal(true);
  };

  const isUnlocked = (badgeId: string) => unlockedBadgeIds.includes(badgeId);

  const monthlyGoal = 30;
  const monthlyProgress = Math.min(100, (stats.monthlySessionCount / monthlyGoal) * 100);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Achievements</Text>
          <Pressable
            onPress={() => router.push("/settings")}
            style={styles.settingsButton}
          >
            <Settings size={22} color={Colors.text} />
          </Pressable>
        </View>

        {/* Daily Streak Card */}
        <View style={styles.streakCard}>
          <View style={styles.streakHeader}>
            <Flame size={24} color={Colors.primary} />
            <Text style={styles.streakLabel}>Daily Streak</Text>
          </View>
          <View style={styles.streakContent}>
            <Text style={styles.streakNumber}>{stats.currentStreak}</Text>
            <Text style={styles.streakDays}>days</Text>
          </View>
          <Text style={styles.streakSubtext}>
            {stats.currentStreak > 0
              ? "Keep it up! You're on fire!"
              : "Start your streak today!"}
          </Text>
        </View>

        {/* Recent Badges */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Trophy size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Recent Badges</Text>
            <Pressable
              onPress={() => setShowAllBadgesModal(true)}
              style={styles.viewAllButton}
            >
              <Text style={styles.viewAllText}>전체보기</Text>
              <ChevronRight size={14} color={Colors.text} />
            </Pressable>
            <Text style={styles.badgeCount}>
              {unlockedBadgeIds.length}/{BADGE_DB.length}
            </Text>
          </View>

          <View style={styles.badgeGrid}>
            {recentBadges.map((badge) => {
              const unlocked = isUnlocked(badge.id);
              const wasJustUnlocked = newlyUnlockedIds.has(badge.id);

              return (
                <AnimatedBadgeIcon
                  key={badge.id}
                  badge={badge}
                  unlocked={unlocked}
                  wasJustUnlocked={wasJustUnlocked}
                  onPress={() => handleBadgePress(badge)}
                />
              );
            })}
          </View>
        </View>

        {/* Monthly Challenge */}
        <View style={styles.challengeCard}>
          <View style={styles.challengeHeader}>
            <Target size={20} color={Colors.text} />
            <Text style={styles.challengeTitle}>Monthly Challenge</Text>
          </View>
          <Text style={styles.challengeSubtitle}>
            {stats.monthlySessionCount} / {monthlyGoal} sessions this month
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${monthlyProgress}%` }]}
            />
          </View>
          <Text style={styles.progressText}>
            {monthlyProgress.toFixed(0)}% complete
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Clock size={28} color={Colors.accent2} />
            <Text style={styles.statValue}>
              {stats.totalHours.toFixed(1)}h
            </Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
          <View style={styles.statCard}>
            <Target size={28} color={Colors.accent1} />
            <Text style={styles.statValue}>{stats.totalAsanas}</Text>
            <Text style={styles.statLabel}>Asanas</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* All Badges Modal */}
      <Modal
        visible={showAllBadgesModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAllBadgesModal(false)}
      >
        <SafeAreaView style={styles.allBadgesModal} edges={['top', 'bottom']}>
          <View style={styles.allBadgesContainer}>
            {/* Modal Header */}
            <View style={styles.allBadgesHeader}>
              <Text style={styles.allBadgesTitle}>All Badges</Text>
              <Pressable
                onPress={() => setShowAllBadgesModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>닫기</Text>
              </Pressable>
            </View>

            {/* Badge List */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.allBadgesContent}
            >
              <View style={styles.allBadgesGrid}>
                {BADGE_DB.map((badge) => {
                  const unlocked = isUnlocked(badge.id);
                  const BadgeIcon = badge.icon;
                  const progress = getBadgeProgressFromPracticeLogs(badge, practiceLogs, practiceLogAsanas);

                  return (
                    <Pressable
                      key={badge.id}
                      onPress={() => {
                        setShowAllBadgesModal(false);
                        setTimeout(() => handleBadgePress(badge), 300);
                      }}
                      style={[
                        styles.allBadgeItem,
                        unlocked ? styles.allBadgeUnlocked : styles.allBadgeLocked,
                      ]}
                    >
                      <View
                        style={[
                          styles.allBadgeIconContainer,
                          {
                            backgroundColor: unlocked
                              ? badge.color + "20"
                              : Colors.background,
                            borderColor: unlocked ? badge.color : Colors.border,
                          },
                        ]}
                      >
                        {unlocked ? (
                          <BadgeIcon size={28} color={badge.color} />
                        ) : (
                          <Lock size={24} color={Colors.textMuted} />
                        )}
                      </View>
                      <View style={styles.allBadgeInfo}>
                        <Text
                          style={[
                            styles.allBadgeTitle,
                            { color: unlocked ? Colors.text : Colors.textMuted },
                          ]}
                          numberOfLines={1}
                        >
                          {badge.title}
                        </Text>
                        {!unlocked && (
                          <View style={styles.allBadgeProgressBar}>
                            <View
                              style={[
                                styles.allBadgeProgressFill,
                                { width: `${progress}%` },
                              ]}
                            />
                          </View>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.allBadgeStatus,
                          { color: unlocked ? Colors.primary : Colors.textMuted },
                        ]}
                      >
                        {unlocked ? "획득" : `${progress}%`}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Badge Detail Modal */}
      <Modal
        visible={showBadgeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBadgeModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowBadgeModal(false)}
        >
          {selectedBadge && (
            <Pressable
              style={styles.modalContent}
              onPress={(e) => e.stopPropagation()}
            >
              {(() => {
                const unlocked = isUnlocked(selectedBadge.id);
                const progress = getBadgeProgressFromPracticeLogs(selectedBadge, practiceLogs, practiceLogAsanas);
                const BadgeIcon = selectedBadge.icon;
                const tierColor = TIER_COLORS[selectedBadge.tier];

                return (
                  <>
                    {/* Badge Icon */}
                    <View style={styles.modalBadgeContainer}>
                      <View
                        style={[
                          styles.modalBadgeIcon,
                          {
                            backgroundColor: unlocked
                              ? selectedBadge.color + "30"
                              : Colors.borderLight,
                            borderColor: unlocked
                              ? selectedBadge.color
                              : Colors.border,
                          },
                        ]}
                      >
                        {unlocked ? (
                          <BadgeIcon size={48} color={selectedBadge.color} />
                        ) : (
                          <Lock size={40} color={Colors.textMuted} />
                        )}
                      </View>
                    </View>

                    {/* Tier Badge */}
                    <View style={styles.tierContainer}>
                      <View
                        style={[
                          styles.tierBadge,
                          { backgroundColor: tierColor.background },
                        ]}
                      >
                        <Text
                          style={[styles.tierText, { color: tierColor.text }]}
                        >
                          {selectedBadge.tier.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    {/* Title */}
                    <Text style={styles.modalTitle}>{selectedBadge.title}</Text>

                    {/* Description */}
                    <Text style={styles.modalDescription}>
                      {selectedBadge.description}
                    </Text>

                    {/* Progress */}
                    {!unlocked && (
                      <View style={styles.modalProgressContainer}>
                        <View style={styles.modalProgressHeader}>
                          <Text style={styles.modalProgressLabel}>Progress</Text>
                          <Text style={styles.modalProgressValue}>
                            {progress}%
                          </Text>
                        </View>
                        <View style={styles.modalProgressBar}>
                          <View
                            style={[
                              styles.modalProgressFill,
                              { width: `${progress}%` },
                            ]}
                          />
                        </View>
                      </View>
                    )}

                    {/* Status */}
                    <View
                      style={[
                        styles.modalStatus,
                        {
                          backgroundColor: unlocked
                            ? Colors.primary + "20"
                            : Colors.borderLight,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.modalStatusText,
                          {
                            color: unlocked ? Colors.primary : Colors.textMuted,
                          },
                        ]}
                      >
                        {unlocked ? "Unlocked!" : "Locked"}
                      </Text>
                    </View>
                  </>
                );
              })()}
            </Pressable>
          )}
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
});

// withObservables로 practice_logs 및 practice_log_asanas 컬렉션 observe
const enhanceAchievementsScreen = withObservables([], () => ({
  practiceLogs: practiceLogsCollection
    .query(Q.sortBy('date', Q.desc))
    .observe(),
  practiceLogAsanas: practiceLogAsanasCollection
    .query()
    .observe(),
}));

const AchievementsScreen = enhanceAchievementsScreen(AchievementsScreenContent);

export default AchievementsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.text,
    letterSpacing: -1,
    flex: 1,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  // Streak Card
  streakCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 24,
    backgroundColor: Colors.secondary,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  streakHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  streakLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  streakContent: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 8,
  },
  streakNumber: {
    fontSize: 64,
    fontWeight: "bold",
    color: Colors.primary,
    letterSpacing: -2,
  },
  streakDays: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  streakSubtext: {
    fontSize: 14,
    color: Colors.textMuted,
    letterSpacing: -0.3,
  },
  // Section
  section: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    letterSpacing: -0.5,
    flex: 1,
  },
  badgeCount: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  // Badge Grid
  badgeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  badgeItem: {
    width: "30%",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
  },
  badgeUnlocked: {
    backgroundColor: Colors.primary + "15",
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  badgeLocked: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
  },
  badgeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  badgeTitle: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  // Challenge Card
  challengeCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 20,
    backgroundColor: Colors.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  challengeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  challengeSubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  progressBar: {
    height: 12,
    backgroundColor: Colors.borderLight,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.accent1,
    borderRadius: 6,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: "right",
    letterSpacing: -0.3,
  },
  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 24,
  },
  statCard: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.secondary,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    gap: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textMuted,
    letterSpacing: -0.3,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: Colors.background,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalBadgeContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  modalBadgeIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
  },
  tierContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tierText: {
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  modalDescription: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  modalProgressContainer: {
    marginBottom: 20,
  },
  modalProgressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  modalProgressLabel: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  modalProgressValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.primary,
  },
  modalProgressBar: {
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    overflow: "hidden",
  },
  modalProgressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  modalStatus: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  modalStatusText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  // View All Button
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 2,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text,
    letterSpacing: -0.3,
  },
  // All Badges Modal
  allBadgesModal: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  allBadgesContainer: {
    flex: 1,
  },
  allBadgesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  allBadgesTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  closeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  allBadgesContent: {
    padding: 24,
  },
  allBadgesGrid: {
    gap: 12,
  },
  allBadgeItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  allBadgeUnlocked: {
    backgroundColor: Colors.secondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  allBadgeLocked: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderStyle: "dashed",
  },
  allBadgeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  allBadgeInfo: {
    flex: 1,
    gap: 4,
  },
  allBadgeTitle: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
  allBadgeProgressBar: {
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    overflow: "hidden",
  },
  allBadgeProgressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  allBadgeStatus: {
    fontSize: 14,
    fontWeight: "600",
  },
});
