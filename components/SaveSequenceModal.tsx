import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { X } from "lucide-react-native";
import { Colors } from "@/constants/Colors";

interface SaveSequenceModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  asanaCount: number;
}

export function SaveSequenceModal({
  visible,
  onClose,
  onSave,
  asanaCount,
}: SaveSequenceModalProps) {
  const [sequenceName, setSequenceName] = useState("");

  const handleSave = () => {
    const trimmedName = sequenceName.trim();
    if (trimmedName) {
      onSave(trimmedName);
      setSequenceName("");
      onClose();
    }
  };

  const handleClose = () => {
    setSequenceName("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>시퀀스 저장</Text>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={Colors.text} />
            </Pressable>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.subtitle}>
              {asanaCount}개의 포즈로 구성된 시퀀스입니다
            </Text>

            <Text style={styles.label}>시퀀스 이름</Text>
            <TextInput
              value={sequenceName}
              onChangeText={setSequenceName}
              placeholder="예: 아침 스트레칭, 힙 오프너 루틴"
              placeholderTextColor={Colors.textMuted}
              style={styles.input}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable
              style={styles.cancelButton}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </Pressable>

            <Pressable
              style={[
                styles.saveButton,
                !sequenceName.trim() && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={!sequenceName.trim()}
            >
              <Text style={styles.saveButtonText}>저장하기</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "85%",
    maxWidth: 400,
    backgroundColor: Colors.background,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
    letterSpacing: -0.3,
    textTransform: "uppercase",
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: Colors.secondary,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    paddingTop: 0,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: Colors.primary,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.background,
    letterSpacing: -0.5,
  },
});
