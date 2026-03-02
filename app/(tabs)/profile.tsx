import { useMemo, memo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Flame, Clock, Target, Settings } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Q } from "@nozbe/watermelondb";
import withObservables from "@nozbe/with-observables";
import { Colors } from "@/constants/Colors";
import { calculateCurrentStreakFromPracticeLogs } from "@/utils/achievements";
import {
  practiceLogsCollection,
  practiceLogAsanasCollection,
  PracticeLog,
  PracticeLogAsana,
} from "@/database";

interface AchievementsScreenContentProps {
  practiceLogs: PracticeLog[];
  practiceLogAsanas: PracticeLogAsana[];
}

const AchievementsScreenContent = memo(({
  practiceLogs,
  practiceLogAsanas,
}: AchievementsScreenContentProps) => {
  const router = useRouter();

  const stats = useMemo(() => {
    const totalMinutes = practiceLogs.reduce((sum, s) => sum + s.duration, 0);
    const totalHours = totalMinutes / 60;
    const totalAsanas = practiceLogAsanas.length;

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

    const currentStreak = calculateCurrentStreakFromPracticeLogs(practiceLogs);

    return {
      totalHours,
      totalAsanas,
      monthlySessionCount,
      currentStreak,
    };
  }, [practiceLogs, practiceLogAsanas]);

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
    </SafeAreaView>
  );
});

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
});
