import React from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { X } from "lucide-react-native";
import { AsanaRecord, AsanaStatus, ASANA_STATUS_CONFIG } from "@/types";
import { AsanaIcon } from "@/components/AsanaIcon";
import { Colors } from "@/constants/Colors";

interface AsanaBlockCardProps {
  asana: AsanaRecord;
  onUpdate: (updates: Partial<AsanaRecord>) => void;
  onRemove: () => void;
}

const STATUS_OPTIONS: AsanaStatus[] = ["mastered", "practicing", "learning", "attempted"];

export function AsanaBlockCard({ asana, onUpdate, onRemove }: AsanaBlockCardProps) {
  return (
    <View style={styles.card}>
      {/* Header with beige background */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <AsanaIcon name={asana.name} size={32} color={Colors.text} />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.asanaName} numberOfLines={1}>
            {asana.name}
          </Text>
        </View>
        <Pressable onPress={onRemove} style={styles.removeButton}>
          <X size={18} color={Colors.text} />
        </Pressable>
      </View>

      {/* Status chips */}
      <View style={styles.statusRow}>
        {STATUS_OPTIONS.map((status) => {
          const config = ASANA_STATUS_CONFIG[status];
          const isSelected = asana.status === status;
          return (
            <Pressable
              key={status}
              onPress={() => onUpdate({ status: isSelected ? undefined : status })}
              style={[
                styles.statusChip,
                {
                  backgroundColor: isSelected ? config.bgColor : Colors.background,
                  borderColor: isSelected ? config.bgColor : Colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: isSelected ? config.color : Colors.textMuted },
                ]}
              >
                {config.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Note input */}
      <TextInput
        value={asana.note}
        onChangeText={(text) => onUpdate({ note: text })}
        placeholder="Notes for this asana..."
        placeholderTextColor={Colors.textMuted}
        multiline
        style={styles.noteInput}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 19,
    backgroundColor: Colors.secondary,  // Beige header
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  titleContainer: {
    flex: 1,
  },
  asanaName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  removeButton: {
    padding: 10,
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    padding: 19,
    paddingTop: 14,
    paddingBottom: 14,
  },
  statusChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: -0.5,
  },
  noteInput: {
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    padding: 19,
    color: Colors.text,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: "top",
    letterSpacing: -0.5,
  },
});
