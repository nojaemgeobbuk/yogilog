import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { Layers, Save, Trash2 } from "lucide-react-native";
import { Colors } from "@/constants/Colors";
import { useSequenceBuilderStore } from "@/store/useSequenceBuilderStore";
import { SaveSequenceModal } from "./SaveSequenceModal";

export function SequenceBuilderBar() {
  const [showSaveModal, setShowSaveModal] = useState(false);

  const { currentBuildingAsanas, saveSequence, clearCurrentBuild } =
    useSequenceBuilderStore();

  const asanaCount = currentBuildingAsanas.length;

  // 아무것도 선택되지 않았으면 바를 숨김
  if (asanaCount === 0) {
    return null;
  }

  const handleSave = (name: string) => {
    saveSequence(name);
  };

  const handleClear = () => {
    clearCurrentBuild();
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.bar}>
          {/* 아이콘 및 카운트 */}
          <View style={styles.infoSection}>
            <View style={styles.iconContainer}>
              <Layers size={18} color={Colors.background} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.countText}>
                {asanaCount}개의 포즈
              </Text>
              <Text style={styles.hintText}>
                시퀀스로 저장할 수 있어요
              </Text>
            </View>
          </View>

          {/* 액션 버튼들 */}
          <View style={styles.actions}>
            {/* 초기화 버튼 */}
            <Pressable
              onPress={handleClear}
              style={styles.clearButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Trash2 size={16} color={Colors.textMuted} />
            </Pressable>

            {/* 저장 버튼 */}
            <Pressable
              onPress={() => setShowSaveModal(true)}
              style={styles.saveButton}
            >
              <Save size={16} color={Colors.background} />
              <Text style={styles.saveButtonText}>시퀀스 저장</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* 저장 모달 */}
      <SaveSequenceModal
        visible={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSave}
        asanaCount={asanaCount}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 19,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: Colors.background,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.text,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  infoSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  countText: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.background,
    letterSpacing: -0.5,
  },
  hintText: {
    fontSize: 11,
    color: Colors.borderLight,
    letterSpacing: -0.3,
    marginTop: 1,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  clearButton: {
    padding: 6,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 5,
  },
  saveButtonText: {
    fontSize: 13,
    fontWeight: "bold",
    color: Colors.background,
    letterSpacing: -0.5,
  },
});
