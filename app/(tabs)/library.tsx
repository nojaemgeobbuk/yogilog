import { useMemo, useState, useCallback, memo } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Library as LibraryIcon,
  Search,
  TrendingUp,
  ChevronRight,
  Play,
  Layers,
  Trash2,
} from "lucide-react-native";
import { Q } from "@nozbe/watermelondb";
import withObservables from "@nozbe/with-observables";
import { Colors } from "@/constants/Colors";
import { AsanaIcon, getAsanaInfo } from "@/components/AsanaIcon";
import { AsanaGrowthTreeCompact } from "@/components/AsanaGrowthTree";
import { useAsanaGrowthLevelBatch, GrowthData } from "@/hooks/useAsanaGrowthLevel";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useSequenceBuilderStore } from "@/store/useSequenceBuilderStore";
import { practiceLogAsanasCollection, practiceLogsCollection, PracticeLogAsana } from "@/database";
import { UserSequence } from "@/types";

interface AsanaStats {
  name: string;
  sanskritName: string | null;
  koreanName: string | null;
  count: number;
  lastPracticed: string;
}

// 아사나 카드 컴포넌트 (React.memo로 최적화)
const AsanaCard = memo(({
  item,
  index,
  growthData,
  onPress,
}: {
  item: AsanaStats;
  index: number;
  growthData: GrowthData | null;
  onPress: (name: string) => void;
}) => {
  const asanaNameLanguage = useSettingsStore((state) => state.asanaNameLanguage);
  const handlePress = useCallback(() => {
    onPress(item.name);
  }, [item.name, onPress]);

  // 언어 설정에 따른 표시 이름
  const displayName = asanaNameLanguage === "korean" && item.koreanName
    ? item.koreanName
    : item.sanskritName || item.name;
  const subName = asanaNameLanguage === "korean"
    ? item.sanskritName
    : item.name;

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

      {/* Text info + Growth Tree */}
      <View style={styles.textContainer}>
        <Text style={styles.englishName} numberOfLines={1}>
          {displayName}
        </Text>
        {subName && (
          <Text style={styles.sanskritName} numberOfLines={1}>
            {subName}
          </Text>
        )}
        {/* 성장 나무 */}
        <AsanaGrowthTreeCompact data={growthData} />
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

// 시퀀스 카드 컴포넌트
const SequenceCard = memo(({
  sequence,
  onDelete,
  onLoad,
}: {
  sequence: UserSequence;
  onDelete: (id: string) => void;
  onLoad: (id: string) => void;
}) => {
  const handleDelete = useCallback(() => {
    Alert.alert(
      "시퀀스 삭제",
      `"${sequence.name}" 시퀀스를 삭제하시겠습니까?`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: () => onDelete(sequence.id),
        },
      ]
    );
  }, [sequence.id, sequence.name, onDelete]);

  const handleLoad = useCallback(() => {
    onLoad(sequence.id);
  }, [sequence.id, onLoad]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <View style={styles.sequenceCard}>
      <View style={styles.sequenceIconContainer}>
        <Layers size={24} color={Colors.primary} />
      </View>
      <View style={styles.sequenceInfo}>
        <Text style={styles.sequenceName} numberOfLines={1}>
          {sequence.name}
        </Text>
        <Text style={styles.sequenceDetail}>
          {sequence.asanas.length}개 포즈 • {formatDate(sequence.createdAt)}
        </Text>
        <View style={styles.sequenceAsanaPreview}>
          {sequence.asanas.slice(0, 4).map((asana, idx) => (
            <View key={asana.itemId} style={styles.miniIcon}>
              <AsanaIcon name={asana.asanaName} size={20} />
            </View>
          ))}
          {sequence.asanas.length > 4 && (
            <Text style={styles.moreText}>+{sequence.asanas.length - 4}</Text>
          )}
        </View>
      </View>
      <View style={styles.sequenceActions}>
        <Pressable onPress={handleLoad} style={styles.loadButton}>
          <Play size={16} color={Colors.background} fill={Colors.background} />
        </Pressable>
        <Pressable onPress={handleDelete} style={styles.deleteButton}>
          <Trash2 size={16} color={Colors.textMuted} />
        </Pressable>
      </View>
    </View>
  );
});

type TabType = "asanas" | "sequences";

// 메인 라이브러리 컴포넌트
interface LibraryScreenContentProps {
  practiceLogAsanas: PracticeLogAsana[];
}

const LibraryScreenContent = memo(({ practiceLogAsanas }: LibraryScreenContentProps) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("asanas");

  // 시퀀스 스토어
  const savedSequences = useSequenceBuilderStore((state) => state.savedSequences);
  const deleteSequence = useSequenceBuilderStore((state) => state.deleteSequence);
  const loadSequenceToBuilder = useSequenceBuilderStore((state) => state.loadSequenceToBuilder);

  const handleDeleteSequence = useCallback((id: string) => {
    deleteSequence(id);
  }, [deleteSequence]);

  const handleLoadSequence = useCallback((id: string) => {
    loadSequenceToBuilder(id);
    router.push("/(modals)/write");
  }, [loadSequenceToBuilder, router]);

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
          koreanName: asanaInfo?.korean || null,
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

  // 성장 레벨 데이터 배치 로드
  const { dataMap: growthDataMap, isLoading: growthLoading } = useAsanaGrowthLevelBatch(asanaNames);

  const filteredAsanas = useMemo(() => {
    if (!searchQuery.trim()) return asanaStats;
    const query = searchQuery.toLowerCase();
    return asanaStats.filter(
      (asana) =>
        asana.name.toLowerCase().includes(query) ||
        (asana.sanskritName && asana.sanskritName.toLowerCase().includes(query)) ||
        (asana.koreanName && asana.koreanName.includes(query))
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
        growthData={growthDataMap.get(item.name) || null}
        onPress={handleAsanaPress}
      />
    );
  }, [growthDataMap, handleAsanaPress]);

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
      edges={['top', 'bottom']}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <LibraryIcon size={28} color={Colors.primary} />
          <Text style={styles.headerTitle}>Library</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          {activeTab === "asanas"
            ? `${totalAsanas} asanas • ${totalPlays} total plays`
            : `${savedSequences.length}개의 시퀀스`}
        </Text>
      </View>

      {/* Tab Toggle */}
      <View style={styles.tabContainer}>
        <Pressable
          onPress={() => setActiveTab("asanas")}
          style={[
            styles.tabButton,
            activeTab === "asanas" && styles.tabButtonActive,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "asanas" && styles.tabTextActive,
            ]}
          >
            아사나
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("sequences")}
          style={[
            styles.tabButton,
            activeTab === "sequences" && styles.tabButtonActive,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "sequences" && styles.tabTextActive,
            ]}
          >
            내 시퀀스
          </Text>
          {savedSequences.length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{savedSequences.length}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {activeTab === "asanas" ? (
        <>
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

          {/* Asana List */}
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
          getItemLayout={(data, index) => {
            const ITEM_HEIGHT = 120;
            const SEPARATOR_HEIGHT = 14;
            return {
              length: ITEM_HEIGHT,
              offset: (ITEM_HEIGHT + SEPARATOR_HEIGHT) * index,
              index,
            };
          }}
        />
      )}
        </>
      ) : (
        /* Sequences List */
        savedSequences.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Layers size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>시퀀스가 없어요</Text>
            <Text style={styles.emptyText}>
              New Session에서 아사나를 선택하고{"\n"}시퀀스로 저장해보세요!
            </Text>
          </View>
        ) : (
          <FlatList
            data={savedSequences}
            renderItem={({ item }) => (
              <SequenceCard
                sequence={item}
                onDelete={handleDeleteSequence}
                onLoad={handleLoadSequence}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )
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
    lineHeight: 24,
  },
  // Tab styles
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 29,
    paddingBottom: 10,
    gap: 10,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: Colors.text,
    borderColor: Colors.text,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    letterSpacing: -0.3,
  },
  tabTextActive: {
    color: Colors.background,
  },
  tabBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: "center",
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
    color: Colors.background,
  },
  // Sequence card styles
  sequenceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sequenceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  sequenceInfo: {
    flex: 1,
  },
  sequenceName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  sequenceDetail: {
    fontSize: 13,
    color: Colors.textMuted,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  sequenceAsanaPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  miniIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: Colors.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  moreText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginLeft: 4,
  },
  sequenceActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
});
