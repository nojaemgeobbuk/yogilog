import { useState, useCallback, memo } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Plus, Star } from "lucide-react-native";
import { Q } from "@nozbe/watermelondb";
import withObservables from "@nozbe/with-observables";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withTiming,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import { AlbumPlaylist } from "@/components/AlbumPlaylist";
import { SkeletonDeck } from "@/components/SkeletonCard";
import { LotusAnimation } from "@/components/LotusAnimation";
import { practiceLogsCollection, PracticeLog, PracticeLogAsana, PracticeLogPhoto } from "@/database";
import { Colors } from "@/constants/Colors";

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const PULL_THRESHOLD = 120; // Pull distance to trigger refresh

type FilterType = "all" | "favorites";

// AlbumPlaylist가 기대하는 형식
interface SessionItem {
  id: string;
  title: string;
  date: string;
  duration: number;
  intensity: number;
  isFavorite: boolean;
  images: string[];
  asanas: { name: string }[];
  hashtags: string[];
  note: string;
}

// PracticeLog 모델에서 SessionItem으로 변환하는 컴포넌트 props
interface EnhancedPracticeLogProps {
  practiceLog: PracticeLog;
  photos: PracticeLogPhoto[];
  asanas: PracticeLogAsana[];
}

// PracticeLog를 SessionItem으로 변환하는 헬퍼
const practiceLogToSessionItem = (
  log: PracticeLog,
  photos: PracticeLogPhoto[],
  asanas: PracticeLogAsana[]
): SessionItem => ({
  id: log.id,
  title: log.title,
  date: log.date,
  duration: log.duration,
  intensity: log.intensity,
  isFavorite: log.isFavorite,
  images: photos.map((p) => p.photoPath),
  asanas: asanas.map((a) => ({ name: a.asanaName })),
  hashtags: [],
  note: log.note || '',
});

// 메인 홈 화면 컴포넌트 (Raw)
interface HomeScreenContentProps {
  practiceLogs: PracticeLog[];
}

const HomeScreenContent = memo(({ practiceLogs }: HomeScreenContentProps) => {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterType>("all");
  const [sessionsMap, setSessionsMap] = useState<Map<string, SessionItem>>(new Map());
  const [loadedCount, setLoadedCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);

  // Animated values for pull-to-refresh
  const scrollY = useSharedValue(0);
  const pullDistance = useSharedValue(0);

  const isLoading = practiceLogs.length > 0 && loadedCount < practiceLogs.length;

  const handleSessionPress = useCallback((session: SessionItem) => {
    router.push(`/session/${session.id}`);
  }, [router]);

  const handleAddSession = useCallback(() => {
    router.push("/(modals)/write");
  }, [router]);

  // Refresh handler
  const triggerRefresh = useCallback(() => {
    setIsRefreshing(true);
    // Simulate refresh - in real app, this would refetch data
    setTimeout(() => {
      setIsRefreshing(false);
      setPullProgress(0);
    }, 2000);
  }, []);

  // Update pull progress for JS thread
  const updatePullProgress = useCallback((progress: number) => {
    setPullProgress(progress);
  }, []);

  // Scroll handler for pull-to-refresh
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;

      if (event.contentOffset.y < 0) {
        const pull = Math.abs(event.contentOffset.y);
        pullDistance.value = pull;
        const progress = Math.min(pull / PULL_THRESHOLD, 1);
        runOnJS(updatePullProgress)(progress);
      } else {
        pullDistance.value = 0;
        runOnJS(updatePullProgress)(0);
      }
    },
    onEndDrag: (event) => {
      if (event.contentOffset.y < -PULL_THRESHOLD) {
        runOnJS(triggerRefresh)();
      }
    },
  });

  // Animated styles for lotus container
  const lotusContainerStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      pullDistance.value,
      [0, PULL_THRESHOLD],
      [-40, 20]
    );
    const scale = interpolate(
      pullDistance.value,
      [0, PULL_THRESHOLD],
      [0.5, 1]
    );
    const opacity = interpolate(
      pullDistance.value,
      [0, 30, PULL_THRESHOLD],
      [0, 0.5, 1]
    );

    return {
      transform: [{ translateY }, { scale }],
      opacity,
    };
  });

  // 세션 목록 (Map에서 배열로 변환, 순서 유지)
  const sessions = practiceLogs
    .map((log) => sessionsMap.get(log.id))
    .filter((s): s is SessionItem => s !== undefined);

  const filteredSessions = filter === "favorites"
    ? sessions.filter((s) => s.isFavorite === true)
    : sessions;

  const favoriteCount = sessions.filter((s) => s.isFavorite === true).length;

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: Colors.backgroundSoft }}
      edges={['top']}
    >
      {/* 각 PracticeLog의 관계 데이터를 observe하는 숨겨진 컴포넌트들 */}
      {practiceLogs.map((log) => (
        <ObservedPracticeLogItemWrapper
          key={log.id}
          practiceLog={log}
          onDataReady={(session: SessionItem) => {
            setSessionsMap((prev) => {
              const next = new Map(prev);
              const isNew = !prev.has(log.id);
              next.set(log.id, session);
              if (isNew) {
                setLoadedCount((c) => c + 1);
              }
              return next;
            });
          }}
        />
      ))}

      {/* Lotus Animation (Pull-to-refresh indicator) */}
      <Animated.View style={[styles.lotusContainer, lotusContainerStyle]}>
        <LotusAnimation
          pullProgress={pullProgress}
          isRefreshing={isRefreshing}
          size={70}
        />
        {isRefreshing && (
          <Text style={styles.refreshText}>Refreshing...</Text>
        )}
      </Animated.View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        bounces={true}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Brand Header Section */}
        <View style={styles.brandSection}>
          <Text style={styles.brandTitle}>Yogilog</Text>
          <Text style={styles.brandSubtitle}>YOUR PRACTICE DECK</Text>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <Pressable
            onPress={() => setFilter("all")}
            style={[
              styles.filterTab,
              filter === "all" && styles.filterTabActive,
            ]}
          >
            <Text style={[
              styles.filterText,
              filter === "all" && styles.filterTextActive,
            ]}>
              All ({sessions.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setFilter("favorites")}
            style={[
              styles.filterTab,
              filter === "favorites" && styles.filterTabFavorite,
            ]}
          >
            <Star
              size={14}
              color={filter === "favorites" ? Colors.background : Colors.text}
              fill={filter === "favorites" ? Colors.background : "transparent"}
            />
            <Text style={[
              styles.filterText,
              filter === "favorites" && styles.filterTextActive,
            ]}>
              Favorites ({favoriteCount})
            </Text>
          </Pressable>
        </View>

        {/* Card Deck Section */}
        <View style={styles.deckSection}>
          {isLoading ? (
            <SkeletonDeck />
          ) : (
            <AlbumPlaylist data={filteredSessions as any} onItemPress={handleSessionPress as any} />
          )}
        </View>
      </Animated.ScrollView>

      {/* Add Button */}
      <View style={styles.buttonContainer}>
        <Pressable
          onPress={handleAddSession}
          style={styles.addButton}
        >
          <Plus size={22} color={Colors.background} strokeWidth={2.5} />
          <Text style={styles.addButtonText}>New Session</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
});

// 관계 데이터를 observe하고 부모에게 전달하는 래퍼 컴포넌트
interface ObservedPracticeLogItemWrapperProps {
  practiceLog: PracticeLog;
  onDataReady: (session: SessionItem) => void;
}

const ObservedPracticeLogItemWrapperBase = memo(({
  practiceLog,
  photos,
  asanas,
  onDataReady
}: EnhancedPracticeLogProps & { onDataReady: (session: SessionItem) => void }) => {
  // 데이터가 준비되면 부모에게 전달
  const session = practiceLogToSessionItem(practiceLog, photos, asanas);

  // useEffect 대신 직접 호출 (observe로 인해 데이터 변경 시 자동 리렌더링)
  // React 18+에서는 이 방식이 안전
  requestAnimationFrame(() => {
    onDataReady(session);
  });

  return null;
});

const ObservedPracticeLogItemWrapper = withObservables(
  ['practiceLog'],
  ({ practiceLog }: ObservedPracticeLogItemWrapperProps) => ({
    practiceLog,
    photos: practiceLog.photosOrdered.observe(),
    asanas: practiceLog.asanasOrdered.observe(),
  })
)(ObservedPracticeLogItemWrapperBase);

// withObservables로 practice_logs 컬렉션 observe
const enhanceHomeScreen = withObservables([], () => ({
  practiceLogs: practiceLogsCollection.query(Q.sortBy('created_at', Q.desc)).observe(),
}));

const HomeScreen = enhanceHomeScreen(HomeScreenContent);

export default HomeScreen;

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingTop: 10,
  },
  lotusContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  refreshText: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  brandSection: {
    alignItems: 'center',
    paddingTop: SCREEN_HEIGHT * 0.03,
    paddingBottom: SCREEN_HEIGHT * 0.02,
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -1.5,
    marginBottom: 6,
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: 'center',
    paddingHorizontal: 29,
    marginBottom: 12,
    gap: 10,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    gap: 6,
    backgroundColor: Colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  filterTabActive: {
    backgroundColor: Colors.text,
  },
  filterTabFavorite: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    letterSpacing: -0.3,
  },
  filterTextActive: {
    color: Colors.background,
  },
  deckSection: {
    flex: 1,
    minHeight: SCREEN_HEIGHT * 0.55,
  },
  buttonContainer: {
    paddingHorizontal: 29,
    paddingBottom: 16,
    paddingTop: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 9999,
    gap: 8,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  addButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.background,
    letterSpacing: -0.3,
  },
});
