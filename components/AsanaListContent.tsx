import React, { useCallback, useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Pressable,
  Animated,
} from "react-native";
import { Heart } from "lucide-react-native";
import { Colors } from "@/constants/Colors";
import { LEVEL_THEME, Asana } from "@/constants/AsanaDefinitions";
import { AsanaIcon } from "@/components/AsanaIcon";
import { useSettingsStore } from "@/store/useSettingsStore";

interface AsanaListContentProps {
  /** 표시할 아사나 목록 */
  asanas: Asana[];
  /** 이미 선택된 아사나 이름 목록 */
  selectedAsanas: string[];
  /** 아사나 선택 시 호출되는 콜백 */
  onSelectAsana: (asanaName: string) => void;
  /** 즐겨찾기 아사나 목록 */
  favoriteAsanas?: string[];
  /** 즐겨찾기 토글 콜백 */
  onToggleFavorite?: (asanaName: string) => void;
  /** 빈 목록일 때 표시할 메시지 */
  emptyMessage?: string;
  /** 빈 목록일 때 표시할 부제목 */
  emptySubMessage?: string;
}

// 애니메이션이 있는 즐겨찾기 버튼 컴포넌트
const AnimatedFavoriteButton = ({
  isFavorite,
  onPress,
  asanaName,
}: {
  isFavorite: boolean;
  onPress: (name: string) => void;
  asanaName: string;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = useCallback(() => {
    // 바운스 애니메이션
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.4,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onPress(asanaName);
  }, [asanaName, onPress, scaleAnim]);

  return (
    <Pressable
      onPress={handlePress}
      style={styles.favoriteButton}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Heart
          size={18}
          color={isFavorite ? Colors.primary : Colors.textMuted}
          fill={isFavorite ? Colors.primary : "transparent"}
        />
      </Animated.View>
    </Pressable>
  );
};

export function AsanaListContent({
  asanas,
  selectedAsanas,
  onSelectAsana,
  favoriteAsanas = [],
  onToggleFavorite,
  emptyMessage = "No asanas found",
  emptySubMessage,
}: AsanaListContentProps) {
  const asanaNameLanguage = useSettingsStore((state) => state.asanaNameLanguage);

  // 이미 선택된 아사나 제외
  const availableAsanas = asanas.filter(
    (asana) => !selectedAsanas.includes(asana.english)
  );

  if (availableAsanas.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
        {emptySubMessage && (
          <Text style={styles.emptySubText}>{emptySubMessage}</Text>
        )}
      </View>
    );
  }

  return (
    <ScrollView
      keyboardShouldPersistTaps="always"
      nestedScrollEnabled={true}
      style={styles.scrollView}
      showsVerticalScrollIndicator={true}
      contentContainerStyle={styles.scrollContent}
    >
      {availableAsanas.map((asana) => {
        const levelInfo = LEVEL_THEME[asana.level];
        const isFavorite = favoriteAsanas.includes(asana.english);

        return (
          <TouchableOpacity
            key={asana.id}
            onPress={() => onSelectAsana(asana.english)}
            activeOpacity={0.7}
            style={styles.asanaItem}
          >
            <View style={styles.asanaContent}>
              {/* Asana icon */}
              <View style={styles.asanaIcon}>
                <AsanaIcon
                  name={asana.sanskrit}
                  size={24}
                  color={Colors.text}
                  fallbackBgColor={Colors.secondary}
                  fallbackTextColor={Colors.text}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.asanaName} numberOfLines={1}>
                  {asanaNameLanguage === "korean" ? asana.korean : asana.sanskrit}
                </Text>
                <Text style={styles.asanaSanskrit} numberOfLines={1}>
                  {asanaNameLanguage === "korean" ? asana.sanskrit : asana.english}
                </Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actionsContainer}>
              {/* Favorite button with animation */}
              {onToggleFavorite && (
                <AnimatedFavoriteButton
                  isFavorite={isFavorite}
                  onPress={onToggleFavorite}
                  asanaName={asana.english}
                />
              )}

              {/* Level badge */}
              <View style={[styles.levelBadge, { backgroundColor: Colors.secondary }]}>
                <Text style={styles.levelText}>{levelInfo.label}</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
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
  asanaItem: {
    paddingHorizontal: 19,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.background,
  },
  asanaContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  asanaIcon: {
    marginRight: 14,
    padding: 10,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
  },
  asanaName: {
    color: Colors.text,
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: -0.5,
  },
  asanaSanskrit: {
    color: Colors.textMuted,
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 2,
    letterSpacing: -0.5,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  favoriteButton: {
    padding: 8,
    borderRadius: 20,
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  levelText: {
    color: Colors.text,
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: -0.5,
  },
});
