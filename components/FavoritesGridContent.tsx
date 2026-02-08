import React, { useCallback, useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Animated,
  Pressable,
} from "react-native";
import { Heart } from "lucide-react-native";
import { Colors } from "@/constants/Colors";
import { Asana } from "@/constants/AsanaDefinitions";
import { AsanaIcon } from "@/components/AsanaIcon";
import { useSettingsStore } from "@/store/useSettingsStore";

const { width: screenWidth } = Dimensions.get("window");
const GRID_COLUMNS = 3;
const GRID_GAP = 10;
const CARD_WIDTH = (screenWidth - 40 - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

interface FavoritesGridContentProps {
  /** 표시할 아사나 목록 */
  asanas: Asana[];
  /** 이미 선택된 아사나 이름 목록 */
  selectedAsanas: string[];
  /** 아사나 선택 시 호출되는 콜백 */
  onSelectAsana: (asanaName: string) => void;
  /** 즐겨찾기 해제 콜백 */
  onToggleFavorite: (asanaName: string) => void;
  /** 빈 목록일 때 표시할 메시지 */
  emptyMessage?: string;
  /** 빈 목록일 때 표시할 부제목 */
  emptySubMessage?: string;
}

// 애니메이션이 있는 즐겨찾기 버튼
const AnimatedHeartButton = ({
  onPress,
  asanaName,
}: {
  onPress: (name: string) => void;
  asanaName: string;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = useCallback(() => {
    // 바운스 애니메이션 후 콜백 실행
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.5,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    onPress(asanaName);
  }, [asanaName, onPress, scaleAnim]);

  return (
    <Pressable
      onPress={handlePress}
      style={styles.favoriteButton}
      hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Heart size={14} color={Colors.primary} fill={Colors.primary} />
      </Animated.View>
    </Pressable>
  );
};

export function FavoritesGridContent({
  asanas,
  selectedAsanas,
  onSelectAsana,
  onToggleFavorite,
  emptyMessage = "즐겨찾기가 없습니다",
  emptySubMessage,
}: FavoritesGridContentProps) {
  const asanaNameLanguage = useSettingsStore((state) => state.asanaNameLanguage);

  // 이미 선택된 아사나 제외
  const availableAsanas = asanas.filter(
    (asana) => !selectedAsanas.includes(asana.english)
  );

  if (availableAsanas.length === 0 && asanas.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Heart size={32} color={Colors.accent1} />
        </View>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
        {emptySubMessage && (
          <Text style={styles.emptySubText}>{emptySubMessage}</Text>
        )}
      </View>
    );
  }

  // 그리드 형태로 배열
  const rows: Asana[][] = [];
  for (let i = 0; i < availableAsanas.length; i += GRID_COLUMNS) {
    rows.push(availableAsanas.slice(i, i + GRID_COLUMNS));
  }

  return (
    <ScrollView
      keyboardShouldPersistTaps="always"
      nestedScrollEnabled={true}
      style={styles.scrollView}
      showsVerticalScrollIndicator={true}
      contentContainerStyle={styles.scrollContent}
    >
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((asana) => (
            <TouchableOpacity
              key={asana.id}
              onPress={() => onSelectAsana(asana.english)}
              activeOpacity={0.7}
              style={[styles.card, { width: CARD_WIDTH }]}
            >
              {/* 즐겨찾기 해제 버튼 with animation */}
              <AnimatedHeartButton
                onPress={onToggleFavorite}
                asanaName={asana.english}
              />

              {/* 아이콘 */}
              <View style={styles.iconContainer}>
                <AsanaIcon
                  name={asana.sanskrit}
                  size={32}
                  color={Colors.text}
                  fallbackBgColor={Colors.secondary}
                  fallbackTextColor={Colors.text}
                />
              </View>

              {/* 이름 */}
              <Text style={styles.asanaName} numberOfLines={2}>
                {asanaNameLanguage === "korean" ? asana.korean : asana.sanskrit}
              </Text>
            </TouchableOpacity>
          ))}
          {/* 빈 공간 채우기 */}
          {row.length < GRID_COLUMNS &&
            Array.from({ length: GRID_COLUMNS - row.length }).map((_, i) => (
              <View key={`empty-${i}`} style={{ width: CARD_WIDTH }} />
            ))}
        </View>
      ))}

      {/* 선택된 아사나들 표시 */}
      {asanas.length > 0 && availableAsanas.length === 0 && (
        <View style={styles.allSelectedContainer}>
          <Text style={styles.allSelectedText}>
            모든 즐겨찾기 아사나가 선택되었습니다
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: Colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  emptySubText: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    letterSpacing: -0.5,
  },
  row: {
    flexDirection: "row",
    gap: GRID_GAP,
    marginBottom: GRID_GAP,
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: 12,
    alignItems: "center",
    position: "relative",
  },
  favoriteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 4,
    zIndex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: Colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  asanaName: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.text,
    textAlign: "center",
    letterSpacing: -0.3,
    lineHeight: 14,
  },
  allSelectedContainer: {
    padding: 20,
    alignItems: "center",
  },
  allSelectedText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: "center",
  },
});
