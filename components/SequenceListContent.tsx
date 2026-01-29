import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Pressable,
  Alert,
} from "react-native";
import { Layers, ChevronRight, Trash2 } from "lucide-react-native";
import { Colors } from "@/constants/Colors";
import { UserSequence } from "@/types";

interface SequenceListContentProps {
  /** 표시할 시퀀스 목록 */
  sequences: UserSequence[];
  /** 시퀀스 선택 시 (해당 시퀀스의 모든 아사나를 추가) */
  onSelectSequence: (sequence: UserSequence) => void;
  /** 시퀀스 삭제 */
  onDeleteSequence?: (sequenceId: string) => void;
  /** 빈 목록일 때 표시할 메시지 */
  emptyMessage?: string;
  /** 빈 목록일 때 표시할 부제목 */
  emptySubMessage?: string;
}

export function SequenceListContent({
  sequences,
  onSelectSequence,
  onDeleteSequence,
  emptyMessage = "No sequences yet",
  emptySubMessage,
}: SequenceListContentProps) {
  if (sequences.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Layers size={32} color={Colors.textMuted} />
        </View>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
        {emptySubMessage && (
          <Text style={styles.emptySubText}>{emptySubMessage}</Text>
        )}
      </View>
    );
  }

  const handleDelete = (sequence: UserSequence) => {
    if (!onDeleteSequence) return;

    Alert.alert(
      "시퀀스 삭제",
      `"${sequence.name}" 시퀀스를 삭제하시겠습니까?`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: () => onDeleteSequence(sequence.id),
        },
      ]
    );
  };

  return (
    <ScrollView
      keyboardShouldPersistTaps="always"
      nestedScrollEnabled={true}
      style={styles.scrollView}
      showsVerticalScrollIndicator={true}
      contentContainerStyle={styles.scrollContent}
    >
      {sequences.map((sequence) => (
        <TouchableOpacity
          key={sequence.id}
          onPress={() => onSelectSequence(sequence)}
          activeOpacity={0.7}
          style={styles.sequenceItem}
        >
          <View style={styles.sequenceContent}>
            {/* 아이콘 */}
            <View style={styles.sequenceIcon}>
              <Layers size={20} color={Colors.text} />
            </View>

            {/* 시퀀스 정보 */}
            <View style={styles.sequenceInfo}>
              <Text style={styles.sequenceName} numberOfLines={1}>
                {sequence.name}
              </Text>
              <Text style={styles.sequenceCount}>
                {sequence.asanas.length}개의 포즈
              </Text>
            </View>
          </View>

          {/* 액션 영역 */}
          <View style={styles.sequenceActions}>
            {onDeleteSequence && (
              <Pressable
                onPress={() => handleDelete(sequence)}
                style={styles.deleteButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Trash2 size={16} color={Colors.textMuted} />
              </Pressable>
            )}
            <ChevronRight size={20} color={Colors.textMuted} />
          </View>
        </TouchableOpacity>
      ))}
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
  emptyIcon: {
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
  sequenceItem: {
    paddingHorizontal: 19,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.background,
  },
  sequenceContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  sequenceIcon: {
    width: 44,
    height: 44,
    marginRight: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  sequenceInfo: {
    flex: 1,
  },
  sequenceName: {
    color: Colors.text,
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: -0.5,
  },
  sequenceCount: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
    letterSpacing: -0.5,
  },
  sequenceActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deleteButton: {
    padding: 4,
  },
});
