import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Pressable,
} from "react-native";
import { Heart } from "lucide-react-native";
import { Colors } from "@/constants/Colors";
import { LEVEL_THEME, Asana } from "@/constants/AsanaDefinitions";
import { AsanaIcon } from "@/components/AsanaIcon";

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

export function AsanaListContent({
  asanas,
  selectedAsanas,
  onSelectAsana,
  favoriteAsanas = [],
  onToggleFavorite,
  emptyMessage = "No asanas found",
  emptySubMessage,
}: AsanaListContentProps) {
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
                  {asana.english}
                </Text>
                <Text style={styles.asanaSanskrit} numberOfLines={1}>
                  {asana.sanskrit}
                </Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actionsContainer}>
              {/* Favorite button */}
              {onToggleFavorite && (
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(asana.english);
                  }}
                  style={styles.favoriteButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Heart
                    size={18}
                    color={isFavorite ? Colors.primary : Colors.textMuted}
                    fill={isFavorite ? Colors.primary : "transparent"}
                  />
                </Pressable>
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
    padding: 4,
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
