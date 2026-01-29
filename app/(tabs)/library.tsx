import { useMemo, useState, useCallback, memo } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Library as LibraryIcon,
  Search,
  TrendingUp,
  ChevronRight,
  Play,
} from "lucide-react-native";
import { Q } from "@nozbe/watermelondb";
import withObservables from "@nozbe/with-observables";
import { Colors } from "@/constants/Colors";
import { AsanaIcon, getAsanaInfo } from "@/components/AsanaIcon";
import { AsanaHeatmapCompact } from "@/components/AsanaHeatmap";
import { useAsanaHeatmapBatch, HeatmapData } from "@/hooks/useAsanaHeatmap";
import { practiceLogAsanasCollection, practiceLogsCollection, PracticeLogAsana } from "@/database";

interface AsanaStats {
  name: string;
  sanskritName: string | null;
  count: number;
  lastPracticed: string;
}

// 아사나 카드 컴포넌트 (React.memo로 최적화)
const AsanaCard = memo(({
  item,
  index,
  heatmapData,
  onPress,
}: {
  item: AsanaStats;
  index: number;
  heatmapData: HeatmapData | null;
  onPress: (name: string) => void;
}) => {
  const handlePress = useCallback(() => {
    onPress(item.name);
  }, [item.name, onPress]);

  return (
    <Pressable onPress={handlePress} style={styles.listItem}>
      {/* Circular icon with unified beige background */}
      <View style={styles.iconContainer}>
        <AsanaIcon
          name={item.name}
          size={32}
          color={Colors.text}
          fallbackBgColor={Colors.secondary}
          fallbackTextColor={Colors.text}
        />
      </View>

      {/* Text info + Heatmap */}
      <View style={styles.textContainer}>
        <Text style={styles.englishName} numberOfLines={1}>
          {item.name}
        </Text>
        {item.sanskritName && (
          <Text style={styles.sanskritName} numberOfLines={1}>
            {item.sanskritName}
          </Text>
        )}
        {/* 4주 히트맵 */}
        <AsanaHeatmapCompact data={heatmapData} />
      </View>

      {/* Play count and arrow */}
      <View style={styles.rightContainer}>
        <View style={styles.playCount}>
          <Play size={12} color={Colors.primary} fill={Colors.primary} />
          <Text style={styles.countText}>{item.count}</Text>
        </View>
        <ChevronRight size={20} color={Colors.textMuted} />
      </View>

      {/* Rank badge (Top 3) */}
      {index < 3 && (
        <View style={[styles.rankBadge, { backgroundColor: getRankColor(index) }]}>
          <Text style={styles.rankText}>#{index + 1}</Text>
        </View>
      )}
    </Pressable>
  );
});

const getRankColor = (index: number) => {
  const colors = [Colors.primary, Colors.primary, Colors.secondary];
  return colors[index] || Colors.secondary;
};

// 메인 라이브러리 컴포넌트
interface LibraryScreenContentProps {
  practiceLogAsanas: PracticeLogAsana[];
}

const LibraryScreenContent = memo(({ practiceLogAsanas }: LibraryScreenContentProps) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // 아사나별 통계 계산
  const asanaStats = useMemo(() => {
    const statsMap = new Map<string, AsanaStats>();

    practiceLogAsanas.forEach((record) => {
      const asanaName = record.asanaName;
      const existing = statsMap.get(asanaName);
      const createdAt = record.createdAt?.toISOString() || new Date().toISOString();

      if (existing) {
        existing.count += 1;
        if (createdAt > existing.lastPracticed) {
          existing.lastPracticed = createdAt;
        }
      } else {
        const asanaInfo = getAsanaInfo(asanaName);
        statsMap.set(asanaName, {
          name: asanaName,
          sanskritName: asanaInfo?.sanskrit || null,
          count: 1,
          lastPracticed: createdAt,
        });
      }
    });

    return Array.from(statsMap.values()).sort((a, b) => b.count - a.count);
  }, [practiceLogAsanas]);

  // 아사나 이름 목록 (히트맵 배치 쿼리용)
  const asanaNames = useMemo(
    () => asanaStats.map((a) => a.name),
    [asanaStats]
  );

  // 히트맵 데이터 배치 로드
  const { dataMap: heatmapDataMap, isLoading: heatmapLoading } = useAsanaHeatmapBatch(asanaNames);

  const filteredAsanas = useMemo(() => {
    if (!searchQuery.trim()) return asanaStats;
    const query = searchQuery.toLowerCase();
    return asanaStats.filter(
      (asana) =>
        asana.name.toLowerCase().includes(query) ||
        (asana.sanskritName && asana.sanskritName.toLowerCase().includes(query))
    );
  }, [asanaStats, searchQuery]);

  const totalAsanas = asanaStats.length;
  const totalPlays = asanaStats.reduce((acc, a) => acc + a.count, 0);

  const handleAsanaPress = useCallback((asanaName: string) => {
    router.push(`/library/${encodeURIComponent(asanaName)}`);
  }, [router]);

  const renderAsanaItem = useCallback(({
    item,
    index,
  }: {
    item: AsanaStats;
    index: number;
  }) => {
    return (
      <AsanaCard
        item={item}
        index={index}
        heatmapData={heatmapDataMap.get(item.name) || null}
        onPress={handleAsanaPress}
      />
    );
  }, [heatmapDataMap, handleAsanaPress]);

  const keyExtractor = useCallback((item: AsanaStats) => item.name, []);

  const ItemSeparator = useCallback(() => <View style={styles.separator} />, []);

  const ListHeader = useMemo(() => {
    if (asanaStats.length > 0 && !searchQuery) {
      return (
        <View style={styles.listHeader}>
          <TrendingUp size={18} color={Colors.primary} />
          <Text style={styles.listHeaderText}>Most Practiced</Text>
        </View>
      );
    }
    return null;
  }, [asanaStats.length, searchQuery]);

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: Colors.background }}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <LibraryIcon size={28} color={Colors.primary} />
          <Text style={styles.headerTitle}>Library</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          {totalAsanas} asanas • {totalPlays} total plays
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.textMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search asanas..."
            placeholderTextColor={Colors.textMuted}
            style={styles.searchInput}
          />
        </View>
      </View>

      {/* List */}
      {filteredAsanas.length === 0 ? (
        <View style={styles.emptyContainer}>
          {asanaStats.length === 0 ? (
            <>
              <Text style={styles.emptyTitle}>No Asanas Yet</Text>
              <Text style={styles.emptyText}>
                Start practicing and your asanas will appear here like your
                favorite artists!
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.emptyTitle}>No Results</Text>
              <Text style={styles.emptyText}>
                No asanas match "{searchQuery}"
              </Text>
            </>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredAsanas}
          renderItem={renderAsanaItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={ItemSeparator}
          ListHeaderComponent={ListHeader}
          // 성능 최적화
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={8}
          getItemLayout={(data, index) => ({
            length: 120, // 대략적인 아이템 높이
            offset: 120 * index + 14 * index, // 높이 + separator
            index,
          })}
        />
      )}
    </SafeAreaView>
  );
});

// withObservables로 practice_log_asanas 컬렉션 observe
const enhanceLibraryScreen = withObservables([], () => ({
  practiceLogAsanas: practiceLogAsanasCollection
    .query(Q.sortBy('created_at', Q.desc))
    .observe(),
}));

const LibraryScreen = enhanceLibraryScreen(LibraryScreenContent);

export default LibraryScreen;

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 29,
    paddingTop: 19,
    paddingBottom: 10,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.textMuted,
    letterSpacing: -0.5,
  },
  searchContainer: {
    paddingHorizontal: 29,
    paddingVertical: 14,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 19,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 14,
    fontSize: 16,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  listContainer: {
    paddingHorizontal: 29,
    paddingBottom: 29,
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 19,
  },
  listHeaderText: {
    fontWeight: "bold",
    color: Colors.text,
    fontSize: 16,
    letterSpacing: -0.5,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 19,
    position: "relative",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 19,
  },
  textContainer: {
    flex: 1,
    justifyContent: "flex-start",
  },
  englishName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  sanskritName: {
    fontSize: 14,
    fontStyle: "italic",
    color: Colors.textMuted,
    letterSpacing: -0.5,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginLeft: 10,
  },
  playCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  countText: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  rankBadge: {
    position: "absolute",
    top: -6,
    left: -6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  rankText: {
    fontSize: 11,
    fontWeight: "bold",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  separator: {
    height: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 38,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textMuted,
    textAlign: "center",
    letterSpacing: -0.5,
  },
});
