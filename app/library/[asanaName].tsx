import { useMemo, useEffect, useState, useCallback, memo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  Clock,
  Calendar,
  TrendingUp,
  Play,
  ChevronRight,
} from "lucide-react-native";
import { Q } from "@nozbe/watermelondb";
import { Colors } from "@/constants/Colors";
import { AsanaIcon } from "@/components/AsanaIcon";
import { AsanaHeatmap } from "@/components/AsanaHeatmap";
import { useAsanaHeatmap } from "@/hooks/useAsanaHeatmap";
import {
  practiceLogAsanasCollection,
  practiceLogsCollection,
  PracticeLog,
} from "@/database";

interface SessionWithPhoto {
  session: PracticeLog;
  firstImage: string | null;
}

interface Stats {
  totalPlays: number;
  totalDuration: number;
  avgIntensity: number;
  firstPracticed: string | null;
  lastPracticed: string | null;
}

export default function AsanaDetailScreen() {
  const { asanaName } = useLocalSearchParams<{ asanaName: string }>();
  const router = useRouter();
  const decodedName = decodeURIComponent(asanaName || "");

  const [sessionsWithPhotos, setSessionsWithPhotos] = useState<SessionWithPhoto[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalPlays: 0,
    totalDuration: 0,
    avgIntensity: 0,
    firstPracticed: null,
    lastPracticed: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // 히트맵 데이터
  const { data: heatmapData, isLoading: heatmapLoading } = useAsanaHeatmap(decodedName);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        // 해당 아사나가 포함된 모든 practice_log_asanas 가져오기
        const asanaRecords = await practiceLogAsanasCollection
          .query(Q.where('asana_name', decodedName))
          .fetch();

        if (asanaRecords.length === 0) {
          if (isMounted) {
            setSessionsWithPhotos([]);
            setIsLoading(false);
          }
          return;
        }

        // 고유한 practice_log_id들 추출
        const logIds = [...new Set(asanaRecords.map((r) => r.practiceLogId))];

        // practice_logs 가져오기
        const logs = await practiceLogsCollection
          .query(Q.where('id', Q.oneOf(logIds)), Q.sortBy('date', Q.desc))
          .fetch();

        // 각 로그의 첫 번째 사진 가져오기
        const sessionsData: SessionWithPhoto[] = await Promise.all(
          logs.map(async (log) => {
            const photos = await log.photosOrdered.fetch();
            return {
              session: log,
              firstImage: photos.length > 0 ? photos[0].photoPath : null,
            };
          })
        );

        // 통계 계산
        const totalDuration = logs.reduce((acc, s) => acc + s.duration, 0);
        const avgIntensity =
          logs.length > 0
            ? logs.reduce((acc, s) => acc + s.intensity, 0) / logs.length
            : 0;

        const sortedByDateAsc = [...logs].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        if (isMounted) {
          setSessionsWithPhotos(sessionsData);
          setStats({
            totalPlays: logs.length,
            totalDuration,
            avgIntensity: Math.round(avgIntensity * 10) / 10,
            firstPracticed: sortedByDateAsc[0]?.date || null,
            lastPracticed: logs[0]?.date || null,
          });
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch asana details:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [decodedName]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  const formatDuration = useCallback((minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  }, []);

  const handleSessionPress = useCallback((sessionId: string) => {
    router.push(`/session/${sessionId}`);
  }, [router]);

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: Colors.background }}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerButton}>
          <ChevronLeft size={28} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Artist</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 38 }}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <AsanaIcon
              name={decodedName}
              size={80}
              color={Colors.text}
              fallbackBgColor={Colors.secondary}
              fallbackTextColor={Colors.text}
            />
          </View>

          <Text style={styles.asanaName}>{decodedName}</Text>

          <Text style={styles.playCount}>
            {stats.totalPlays} {stats.totalPlays === 1 ? "Play" : "Plays"}
          </Text>

          {/* 4주 히트맵 */}
          <View style={styles.heatmapContainer}>
            <AsanaHeatmap data={heatmapData} isLoading={heatmapLoading} />
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            <View style={[styles.statItem, styles.statBorderRight, styles.statBorderBottom]}>
              <Play size={24} color={Colors.primary} />
              <Text style={styles.statValue}>{stats.totalPlays}</Text>
              <Text style={styles.statLabel}>Total Plays</Text>
            </View>

            <View style={[styles.statItem, styles.statBorderBottom]}>
              <Clock size={24} color={Colors.primary} />
              <Text style={styles.statValue}>{formatDuration(stats.totalDuration)}</Text>
              <Text style={styles.statLabel}>Total Time</Text>
            </View>

            <View style={[styles.statItem, styles.statBorderRight]}>
              <TrendingUp size={24} color={Colors.primary} />
              <Text style={styles.statValue}>{stats.avgIntensity}/5</Text>
              <Text style={styles.statLabel}>Avg Intensity</Text>
            </View>

            <View style={styles.statItem}>
              <Calendar size={24} color={Colors.primary} />
              <Text style={styles.statValue}>
                {stats.firstPracticed
                  ? formatDate(stats.firstPracticed)
                  : "N/A"}
              </Text>
              <Text style={styles.statLabel}>First Played</Text>
            </View>
          </View>
        </View>

        {/* Sessions List */}
        <View style={styles.sessionsSection}>
          <Text style={styles.sectionTitle}>Discography</Text>

          {isLoading ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Loading...</Text>
            </View>
          ) : sessionsWithPhotos.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                No sessions found with this asana
              </Text>
            </View>
          ) : (
            <View style={styles.sessionsList}>
              {sessionsWithPhotos.map(({ session, firstImage }) => (
                <SessionListItem
                  key={session.id}
                  session={session}
                  firstImage={firstImage}
                  onPress={() => handleSessionPress(session.id)}
                  formatDuration={formatDuration}
                  formatDate={formatDate}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface SessionListItemProps {
  session: PracticeLog;
  firstImage: string | null;
  onPress: () => void;
  formatDuration: (minutes: number) => string;
  formatDate: (dateString: string) => string;
}

const SessionListItem = memo(({
  session,
  firstImage,
  onPress,
  formatDuration,
  formatDate,
}: SessionListItemProps) => {
  return (
    <Pressable onPress={onPress} style={styles.sessionItem}>
      {/* Thumbnail */}
      {firstImage ? (
        <Image
          source={{ uri: firstImage }}
          style={styles.thumbnail}
        />
      ) : (
        <View style={styles.thumbnailPlaceholder}>
          <Text style={{ fontSize: 24 }}>🧘</Text>
        </View>
      )}

      {/* Info */}
      <View style={styles.sessionInfo}>
        <Text style={styles.sessionTitle} numberOfLines={1}>
          {session.title}
        </Text>
        <View style={styles.sessionMeta}>
          <Text style={styles.metaText}>{formatDate(session.date)}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.durationText}>{formatDuration(session.duration)}</Text>
        </View>
      </View>

      {/* Arrow */}
      <ChevronRight size={20} color={Colors.textMuted} />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerButton: {
    padding: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  heroSection: {
    paddingHorizontal: 29,
    alignItems: "center",
    marginTop: 29,
  },
  heroIcon: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 19,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  asanaName: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  playCount: {
    fontSize: 16,
    color: Colors.textMuted,
    letterSpacing: -0.5,
  },
  heatmapContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  statsContainer: {
    paddingHorizontal: 29,
    marginTop: 29,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  statItem: {
    width: "50%",
    padding: 19,
    alignItems: "center",
  },
  statBorderRight: {
    borderRightWidth: 1,
    borderRightColor: Colors.borderLight,
  },
  statBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textMuted,
    letterSpacing: -0.5,
  },
  sessionsSection: {
    paddingHorizontal: 29,
    marginTop: 29,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 14,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  emptyCard: {
    padding: 29,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyText: {
    color: Colors.textMuted,
    letterSpacing: -0.5,
  },
  sessionsList: {
    gap: 14,
  },
  sessionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  thumbnailPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.secondary,
  },
  sessionInfo: {
    flex: 1,
    marginLeft: 14,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  sessionMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 5,
  },
  metaText: {
    fontSize: 14,
    color: Colors.textMuted,
    letterSpacing: -0.5,
  },
  metaDot: {
    color: Colors.textMuted,
  },
  durationText: {
    fontSize: 14,
    color: Colors.primary,
    letterSpacing: -0.5,
  },
});
