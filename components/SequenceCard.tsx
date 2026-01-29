import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { Layers, Plus, Trash2, ChevronRight } from "lucide-react-native";
import { Colors } from "@/constants/Colors";
import { UserSequence } from "@/types";
import { AsanaIcon } from "./AsanaIcon";

interface SequenceCardProps {
  sequence: UserSequence;
  /** 시퀀스 추가 버튼 클릭 시 */
  onAdd: (sequence: UserSequence) => void;
  /** 시퀀스 삭제 버튼 클릭 시 */
  onDelete?: (sequenceId: string) => void;
  /** 카드 전체 클릭 시 (상세 보기 등) */
  onPress?: (sequence: UserSequence) => void;
  /** 컴팩트 모드 (작은 카드) */
  compact?: boolean;
}

export function SequenceCard({
  sequence,
  onAdd,
  onDelete,
  onPress,
  compact = false,
}: SequenceCardProps) {
  // 시퀀스에 포함된 아사나 미리보기 (최대 4개)
  const previewAsanas = sequence.asanas.slice(0, 4);
  const remainingCount = Math.max(0, sequence.asanas.length - 4);

  const handleAdd = () => {
    onAdd(sequence);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(sequence.id);
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress(sequence);
    }
  };

  if (compact) {
    return (
      <Pressable
        onPress={handlePress}
        style={styles.compactCard}
      >
        <View style={styles.compactContent}>
          <View style={styles.compactIcon}>
            <Layers size={16} color={Colors.text} />
          </View>
          <View style={styles.compactInfo}>
            <Text style={styles.compactName} numberOfLines={1}>
              {sequence.name}
            </Text>
            <Text style={styles.compactCount}>
              {sequence.asanas.length}개 포즈
            </Text>
          </View>
        </View>
        <Pressable
          onPress={handleAdd}
          style={styles.compactAddButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Plus size={18} color={Colors.background} />
        </Pressable>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      style={styles.card}
    >
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Layers size={20} color={Colors.text} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.sequenceName} numberOfLines={1}>
              {sequence.name}
            </Text>
            <Text style={styles.sequenceCount}>
              {sequence.asanas.length}개의 포즈
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          {onDelete && (
            <Pressable
              onPress={handleDelete}
              style={styles.deleteButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Trash2 size={18} color={Colors.textMuted} />
            </Pressable>
          )}
          <ChevronRight size={20} color={Colors.textMuted} />
        </View>
      </View>

      {/* 아사나 미리보기 */}
      <View style={styles.previewContainer}>
        <View style={styles.previewRow}>
          {previewAsanas.map((asana, index) => (
            <View key={asana.itemId || index} style={styles.previewItem}>
              <View style={styles.previewIconWrapper}>
                <AsanaIcon
                  name={asana.asanaName}
                  size={20}
                  color={Colors.text}
                  fallbackBgColor={Colors.secondary}
                  fallbackTextColor={Colors.text}
                />
              </View>
              <Text style={styles.previewName} numberOfLines={1}>
                {asana.asanaName.split(' ')[0]}
              </Text>
            </View>
          ))}
          {remainingCount > 0 && (
            <View style={styles.moreIndicator}>
              <Text style={styles.moreText}>+{remainingCount}</Text>
            </View>
          )}
        </View>
      </View>

      {/* 추가 버튼 */}
      <Pressable onPress={handleAdd} style={styles.addButton}>
        <Plus size={18} color={Colors.background} />
        <Text style={styles.addButtonText}>세션에 추가</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  sequenceName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  sequenceCount: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
    letterSpacing: -0.3,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deleteButton: {
    padding: 4,
  },
  previewContainer: {
    marginBottom: 14,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  previewItem: {
    alignItems: "center",
    width: 56,
  },
  previewIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  previewName: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  moreIndicator: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.borderLight,
    justifyContent: "center",
    alignItems: "center",
  },
  moreText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textMuted,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.background,
    letterSpacing: -0.5,
  },
  // Compact 스타일
  compactCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  compactContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  compactIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  compactInfo: {
    flex: 1,
  },
  compactName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  compactCount: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  compactAddButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
});
