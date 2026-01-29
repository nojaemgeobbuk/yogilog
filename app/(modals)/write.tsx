import { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  Platform,
  LayoutAnimation,
  UIManager,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Crypto from "expo-crypto";
import DateTimePicker from "@react-native-community/datetimepicker";
import { X, Camera, Calendar, Save, Minus, Plus } from "lucide-react-native";
import {
  RichEditor,
  RichToolbar,
  actions,
} from "react-native-pell-rich-editor";
import { usePracticeLogs } from "@/hooks/usePracticeLogs";
import { useSequenceBuilderStore } from "@/store/useSequenceBuilderStore";
import { AsanaInput } from "@/components/AsanaInput";
import { AsanaBlockCard } from "@/components/AsanaBlockCard";
import { SequenceBuilderBar } from "@/components/SequenceBuilderBar";
import { Colors } from "@/constants/Colors";
import { AsanaRecord } from "@/types";
import type { AsanaStatus } from "@/database";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function WriteModal() {
  const router = useRouter();
  const { createPracticeLog } = usePracticeLogs();
  const clearCurrentBuild = useSequenceBuilderStore((state) => state.clearCurrentBuild);
  const richText = useRef<RichEditor>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [duration, setDuration] = useState(30);
  const [intensity, setIntensity] = useState(3);
  const [images, setImages] = useState<string[]>([]);
  const [asanas, setAsanas] = useState<AsanaRecord[]>([]);
  const [hashtagInput, setHashtagInput] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const addHashtag = () => {
    const tag = hashtagInput.trim().replace(/^#/, "");
    if (tag && !hashtags.includes(tag)) {
      setHashtags([...hashtags, tag]);
      setHashtagInput("");
    }
  };

  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter((t) => t !== tag));
  };

  const handleAddAsana = useCallback((asanaNames: string[]) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const existingNames = asanas.map((a) => a.name);
    const newAsanas: AsanaRecord[] = asanaNames
      .filter((name) => !existingNames.includes(name))
      .map((name) => ({
        asanaId: Crypto.randomUUID(),
        name,
        note: "",
        status: undefined,
      }));

    const updatedAsanas = asanas.filter((a) => asanaNames.includes(a.name));

    setAsanas([...updatedAsanas, ...newAsanas]);
  }, [asanas]);

  const updateAsana = useCallback((asanaId: string, updates: Partial<AsanaRecord>) => {
    setAsanas((prev) =>
      prev.map((a) => (a.asanaId === asanaId ? { ...a, ...updates } : a))
    );
  }, []);

  const removeAsana = useCallback((asanaId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAsanas((prev) => prev.filter((a) => a.asanaId !== asanaId));
  }, []);

  const handleClose = () => {
    clearCurrentBuild();
    router.back();
  };

  const handleSave = async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      // WatermelonDB에 저장 (트랜잭션으로 practice_log, practice_log_asanas, practice_log_photos 저장)
      await createPracticeLog({
        title: title || `Session ${new Date().toLocaleDateString()}`,
        date: date.toISOString(),
        duration,
        intensity,
        note,
        // asanas 배열을 WatermelonDB 형식으로 매핑
        asanas: asanas.map((a) => ({
          name: a.name,
          note: a.note,
          status: a.status as AsanaStatus | undefined,
        })),
        // images 배열을 photos로 매핑 (practice_log_photos 테이블에 저장됨)
        photos: images,
      });

      clearCurrentBuild();
      router.back();
    } catch (error) {
      console.error('Failed to save session:', error);
      Alert.alert('저장 실패', '수련 기록 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (d: Date) => {
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const asanaNames = asanas.map((a) => a.name);

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: Colors.background }}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleClose} style={styles.headerButton}>
          <X size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>New Session</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        nestedScrollEnabled={true}
      >
        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TITLE</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Morning Flow"
            placeholderTextColor={Colors.textMuted}
            style={styles.textInput}
          />
        </View>

        {/* Images */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PHOTOS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.imageRow}>
              {images.map((uri, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri }} style={styles.image} />
                  <Pressable
                    onPress={() => removeImage(index)}
                    style={styles.imageRemoveButton}
                  >
                    <X size={14} color={Colors.background} />
                  </Pressable>
                </View>
              ))}
              <Pressable onPress={pickImage} style={styles.addImageButton}>
                <Camera size={28} color={Colors.text} />
              </Pressable>
            </View>
          </ScrollView>
        </View>

        {/* Date */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DATE</Text>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            style={styles.dateButton}
          >
            <Calendar size={20} color={Colors.primary} />
            <Text style={styles.dateText}>{formatDate(date)}</Text>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_, selectedDate) => {
                setShowDatePicker(Platform.OS === "ios");
                if (selectedDate) setDate(selectedDate);
              }}
              themeVariant="light"
            />
          )}
        </View>

        {/* Duration */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DURATION (minutes)</Text>
          <View style={styles.durationRow}>
            <Pressable
              onPress={() => setDuration(Math.max(5, duration - 5))}
              style={styles.durationButton}
            >
              <Minus size={20} color={Colors.background} />
            </Pressable>
            <Text style={styles.durationValue}>{duration}</Text>
            <Pressable
              onPress={() => setDuration(duration + 5)}
              style={styles.durationButton}
            >
              <Plus size={20} color={Colors.background} />
            </Pressable>
          </View>
        </View>

        {/* Intensity */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>INTENSITY</Text>
          <View style={styles.intensityRow}>
            {[1, 2, 3, 4, 5].map((level) => (
              <Pressable
                key={level}
                onPress={() => setIntensity(level)}
                style={[
                  styles.intensityButton,
                  level <= intensity && styles.intensityButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.intensityText,
                    level <= intensity && styles.intensityTextActive,
                  ]}
                >
                  {level}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Asanas */}
        <View style={[styles.section, { zIndex: 1000, position: 'relative' }]}>
          <Text style={styles.sectionLabel}>ASANAS ({asanas.length})</Text>
          <AsanaInput value={asanaNames} onChange={handleAddAsana} />

          {asanas.length > 0 && (
            <View style={styles.asanaList}>
              {asanas.map((asana) => (
                <AsanaBlockCard
                  key={asana.asanaId}
                  asana={asana}
                  onUpdate={(updates) => updateAsana(asana.asanaId, updates)}
                  onRemove={() => removeAsana(asana.asanaId)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Hashtags */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>HASHTAGS</Text>
          {hashtags.length > 0 && (
            <View style={styles.tagsRow}>
              {hashtags.map((tag, index) => (
                <Pressable
                  key={index}
                  onPress={() => removeHashtag(tag)}
                  style={styles.tagChip}
                >
                  <Text style={styles.tagChipText}>#{tag}</Text>
                  <X size={14} color={Colors.text} />
                </Pressable>
              ))}
            </View>
          )}
          <TextInput
            value={hashtagInput}
            onChangeText={setHashtagInput}
            onSubmitEditing={addHashtag}
            placeholder="Add hashtag"
            placeholderTextColor={Colors.textMuted}
            style={styles.textInput}
          />
        </View>

        {/* Notes - Rich Text Editor */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>NOTES</Text>
          <View style={styles.editorContainer}>
            <RichEditor
              ref={richText}
              initialContentHTML={note}
              onChange={setNote}
              placeholder="How was today's practice? Feel free to write..."
              editorStyle={{
                backgroundColor: Colors.background,
                color: Colors.text,
                placeholderColor: Colors.textMuted,
                contentCSSText: `
                  * {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    color: ${Colors.text};
                    letter-spacing: -0.5px;
                  }
                  body {
                    background-color: ${Colors.background};
                    padding: 19px;
                    margin: 0;
                    min-height: 250px;
                  }
                  p { margin: 0 0 12px 0; line-height: 1.6; }
                  h1, h2, h3 { color: ${Colors.text}; margin: 16px 0 8px 0; }
                  h1 { font-size: 24px; }
                  h2 { font-size: 20px; }
                  h3 { font-size: 18px; }
                  ul, ol { margin: 8px 0; padding-left: 24px; }
                  li { margin: 4px 0; line-height: 1.5; }
                  blockquote {
                    border-left: 3px solid ${Colors.primary};
                    margin: 12px 0;
                    padding-left: 16px;
                    color: ${Colors.textMuted};
                    font-style: italic;
                  }
                `,
                caretColor: Colors.primary,
              }}
              style={{ flex: 1, minHeight: 250 }}
              initialHeight={250}
              useContainer={true}
            />
          </View>
          {/* Rich Toolbar */}
          <RichToolbar
            editor={richText}
            selectedIconTint={Colors.primary}
            iconTint={Colors.textMuted}
            style={styles.toolbar}
            actions={[
              actions.setBold,
              actions.setItalic,
              actions.setUnderline,
              actions.heading1,
              actions.heading2,
              actions.insertBulletsList,
              actions.insertOrderedList,
              actions.checkboxList,
              actions.blockquote,
              actions.undo,
              actions.redo,
            ]}
          />
        </View>
      </ScrollView>

      {/* Sequence Builder Bar - 시퀀스 저장용 */}
      <SequenceBuilderBar />

      {/* Save Button */}
      <View style={styles.saveButtonContainer}>
        <Pressable
          onPress={handleSave}
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          disabled={isSaving}
        >
          <Save size={24} color={Colors.background} />
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : 'Save Session'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 19,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  scrollContent: {
    paddingHorizontal: 19,
    paddingBottom: 19,
  },
  section: {
    marginTop: 29,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 10,
    color: Colors.textMuted,
    letterSpacing: -0.5,
  },
  textInput: {
    paddingHorizontal: 19,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: Colors.background,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    letterSpacing: -0.5,
  },
  imageRow: {
    flexDirection: "row",
    gap: 14,
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: 96,
    height: 96,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imageRemoveButton: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.text,
  },
  addImageButton: {
    width: 96,
    height: 96,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: Colors.border,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 19,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateText: {
    marginLeft: 14,
    fontSize: 16,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 19,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  durationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.text,
  },
  durationValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  intensityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 19,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  intensityButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  intensityButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  intensityText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textMuted,
    letterSpacing: -0.5,
  },
  intensityTextActive: {
    color: Colors.background,
  },
  asanaList: {
    marginTop: 19,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 9999,
    gap: 5,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagChipText: {
    color: Colors.text,
    letterSpacing: -0.5,
  },
  editorContainer: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    minHeight: 300,
  },
  toolbar: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    marginTop: 10,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveButtonContainer: {
    paddingHorizontal: 19,
    paddingBottom: 19,
    paddingTop: 10,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 9999,
    gap: 10,
    backgroundColor: Colors.primary,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.background,
    letterSpacing: -0.5,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
});
