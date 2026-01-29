import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  Platform,
  Alert,
  LayoutAnimation,
  UIManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Crypto from "expo-crypto";
import DateTimePicker from "@react-native-community/datetimepicker";
import { X, Camera, Calendar, Save, Minus, Plus } from "lucide-react-native";
import {
  RichEditor,
  RichToolbar,
  actions,
} from "react-native-pell-rich-editor";
import { usePracticeLogs, getPracticeLogDetails } from "@/hooks/usePracticeLogs";
import { practiceLogsCollection } from "@/database";
import { useSequenceBuilderStore } from "@/store/useSequenceBuilderStore";
import { AsanaInput } from "@/components/AsanaInput";
import { AsanaBlockCard } from "@/components/AsanaBlockCard";
import { SequenceBuilderBar } from "@/components/SequenceBuilderBar";
import { Colors } from "@/constants/Colors";
import { AsanaRecord } from "@/types";
import type { AsanaStatus } from "@/database";

// Android에서 LayoutAnimation 활성화
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function EditSessionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const richText = useRef<RichEditor>(null);

  const { updatePracticeLog } = usePracticeLogs();
  const clearCurrentBuild = useSequenceBuilderStore((state) => state.clearCurrentBuild);

  const [isLoading, setIsLoading] = useState(true);
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

  // WatermelonDB에서 세션 데이터 로드
  useEffect(() => {
    async function loadSession() {
      if (!id) {
        setIsLoading(false);
        return;
      }

      try {
        const practiceLog = await practiceLogsCollection.find(id);

        // 관련 데이터 가져오기 (아사나, 사진)
        const details = await getPracticeLogDetails(practiceLog);

        // 폼에 데이터 설정
        setTitle(practiceLog.title);
        setNote(practiceLog.note || '');
        setDate(new Date(practiceLog.date));
        setDuration(practiceLog.duration);
        setIntensity(practiceLog.intensity);
        setImages(details.images);
        setAsanas(details.asanas);
        setHashtags([]); // hashtags는 아직 별도 테이블로 관리 안 함

        // RichEditor에 초기 콘텐츠 설정
        if (richText.current && practiceLog.note) {
          richText.current.setContentHTML(practiceLog.note);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load session:', error);
        Alert.alert('오류', '수련 기록을 찾을 수 없습니다.', [
          { text: '확인', onPress: () => router.back() }
        ]);
        setIsLoading(false);
      }
    }

    loadSession();
  }, [id, router]);

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

  // 아사나 추가 핸들러 (AsanaInput에서 선택 시 호출)
  const handleAddAsana = useCallback((asanaNames: string[]) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    // 새로 추가된 아사나만 찾기
    const existingNames = asanas.map((a) => a.name);
    const newAsanas: AsanaRecord[] = asanaNames
      .filter((name) => !existingNames.includes(name))
      .map((name) => ({
        asanaId: Crypto.randomUUID(),
        name,
        note: "",
        status: undefined,
      }));

    // 삭제된 아사나 처리
    const updatedAsanas = asanas.filter((a) => asanaNames.includes(a.name));

    setAsanas([...updatedAsanas, ...newAsanas]);
  }, [asanas]);

  // 개별 아사나 업데이트
  const updateAsana = useCallback((asanaId: string, updates: Partial<AsanaRecord>) => {
    setAsanas((prev) =>
      prev.map((a) => (a.asanaId === asanaId ? { ...a, ...updates } : a))
    );
  }, []);

  // 아사나 제거
  const removeAsana = useCallback((asanaId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAsanas((prev) => prev.filter((a) => a.asanaId !== asanaId));
  }, []);

  const handleClose = () => {
    clearCurrentBuild();
    router.back();
  };

  const handleSave = async () => {
    if (!id || isSaving) return;

    setIsSaving(true);
    try {
      // WatermelonDB 업데이트 (트랜잭션으로 practice_log, practice_log_asanas, practice_log_photos 업데이트)
      await updatePracticeLog(id, {
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
      console.error('Failed to update session:', error);
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

  // AsanaInput용 이름 배열 (AsanaInput은 string[] 형태로 동작)
  const asanaNames = asanas.map((a) => a.name);

  // 로딩 중이면 로딩 표시
  if (isLoading) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: Colors.background }}
      >
        <Text className="text-4xl mb-4">🧘</Text>
        <Text style={{ color: Colors.textMuted }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: Colors.background }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b" style={{ borderBottomColor: Colors.border }}>
        <Pressable onPress={handleClose} className="p-2">
          <X size={24} color={Colors.text} />
        </Pressable>
        <Text className="text-xl font-bold" style={{ color: Colors.text }}>
          Edit Session
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        nestedScrollEnabled={true}
      >
        {/* Title */}
        <View className="mt-6">
          <Text className="text-sm font-medium mb-2" style={{ color: Colors.textMuted }}>
            TITLE
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Morning Flow"
            placeholderTextColor={Colors.textMuted}
            className="px-4 py-3 rounded-xl text-base"
            style={{ backgroundColor: Colors.cardSolid, color: Colors.text }}
          />
        </View>

        {/* Images */}
        <View className="mt-6">
          <Text className="text-sm font-medium mb-2" style={{ color: Colors.textMuted }}>
            PHOTOS
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-3">
            <View className="flex-row gap-3">
              {images.map((uri, index) => (
                <View key={index} className="relative">
                  <Image
                    source={{ uri }}
                    className="w-24 h-24 rounded-xl"
                  />
                  <Pressable
                    onPress={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full items-center justify-center"
                    style={{ backgroundColor: Colors.primary }}
                  >
                    <X size={14} color={Colors.text} />
                  </Pressable>
                </View>
              ))}
              <Pressable
                onPress={pickImage}
                className="w-24 h-24 rounded-xl items-center justify-center border-2 border-dashed"
                style={{ borderColor: Colors.primary }}
              >
                <Camera size={28} color={Colors.primary} />
              </Pressable>
            </View>
          </ScrollView>
        </View>

        {/* Date */}
        <View className="mt-6">
          <Text className="text-sm font-medium mb-2" style={{ color: Colors.textMuted }}>
            DATE
          </Text>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            className="flex-row items-center px-4 py-3 rounded-xl"
            style={{ backgroundColor: Colors.cardSolid }}
          >
            <Calendar size={20} color={Colors.primary} />
            <Text className="ml-3 text-base" style={{ color: Colors.text }}>
              {formatDate(date)}
            </Text>
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
              themeVariant="dark"
            />
          )}
        </View>

        {/* Duration */}
        <View className="mt-6">
          <Text className="text-sm font-medium mb-2" style={{ color: Colors.textMuted }}>
            DURATION (minutes)
          </Text>
          <View className="flex-row items-center justify-between px-4 py-3 rounded-xl" style={{ backgroundColor: Colors.cardSolid }}>
            <Pressable
              onPress={() => setDuration(Math.max(5, duration - 5))}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: Colors.primary }}
            >
              <Minus size={20} color={Colors.text} />
            </Pressable>
            <Text className="text-2xl font-bold" style={{ color: Colors.text }}>
              {duration}
            </Text>
            <Pressable
              onPress={() => setDuration(duration + 5)}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: Colors.primary }}
            >
              <Plus size={20} color={Colors.text} />
            </Pressable>
          </View>
        </View>

        {/* Intensity */}
        <View className="mt-6">
          <Text className="text-sm font-medium mb-2" style={{ color: Colors.textMuted }}>
            INTENSITY
          </Text>
          <View className="flex-row justify-between px-4 py-3 rounded-xl" style={{ backgroundColor: Colors.cardSolid }}>
            {[1, 2, 3, 4, 5].map((level) => (
              <Pressable
                key={level}
                onPress={() => setIntensity(level)}
                className="w-12 h-12 rounded-full items-center justify-center"
                style={{
                  backgroundColor: level <= intensity ? Colors.accent : Colors.border,
                }}
              >
                <Text
                  className="text-lg font-bold"
                  style={{ color: level <= intensity ? Colors.background : Colors.textMuted }}
                >
                  {level}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Asanas - 검색 입력 + 블록 카드 목록 */}
        <View className="mt-6" style={{ zIndex: 1000, position: 'relative' }}>
          <Text className="text-sm font-medium mb-2" style={{ color: Colors.textMuted }}>
            ASANAS ({asanas.length})
          </Text>

          {/* 아사나 검색 입력 */}
          <AsanaInput value={asanaNames} onChange={handleAddAsana} />

          {/* 아사나 블록 카드 목록 */}
          {asanas.length > 0 && (
            <View className="mt-4">
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
        <View className="mt-6">
          <Text className="text-sm font-medium mb-2" style={{ color: Colors.textMuted }}>
            HASHTAGS
          </Text>
          {hashtags.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mb-3">
              {hashtags.map((tag, index) => (
                <Pressable
                  key={index}
                  onPress={() => removeHashtag(tag)}
                  className="flex-row items-center px-3 py-2 rounded-full"
                  style={{ backgroundColor: Colors.accent + "30" }}
                >
                  <Text style={{ color: Colors.accent }}>#{tag}</Text>
                  <X size={14} color={Colors.accent} className="ml-1" />
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
            className="px-4 py-3 rounded-xl text-base"
            style={{ backgroundColor: Colors.cardSolid, color: Colors.text }}
          />
        </View>

        {/* Notes - Rich Text Editor */}
        <View className="mt-6 mb-6">
          <Text className="text-sm font-medium mb-2" style={{ color: Colors.textMuted }}>
            NOTES
          </Text>
          <View
            style={{
              borderRadius: 16,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: Colors.border,
              backgroundColor: Colors.cardSolid,
              minHeight: 300,
            }}
          >
            <RichEditor
              ref={richText}
              initialContentHTML={note}
              onChange={setNote}
              placeholder="오늘의 수련은 어땠나요? 자유롭게 기록해보세요..."
              editorStyle={{
                backgroundColor: Colors.cardSolid,
                color: Colors.text,
                placeholderColor: Colors.textMuted,
                contentCSSText: `
                  * {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    color: ${Colors.text};
                  }
                  body {
                    background-color: ${Colors.cardSolid};
                    padding: 16px;
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
            selectedIconTint={Colors.accent}
            iconTint={Colors.textMuted}
            style={{
              backgroundColor: Colors.cardSolid,
              borderRadius: 12,
              marginTop: 8,
              height: 44,
              borderWidth: 1,
              borderColor: Colors.border,
            }}
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
      <View className="px-4 pb-4 pt-2">
        <Pressable
          onPress={handleSave}
          className="flex-row items-center justify-center py-4 rounded-full gap-2"
          style={[
            { backgroundColor: Colors.accent },
            isSaving && { opacity: 0.6 }
          ]}
          disabled={isSaving}
        >
          <Save size={24} color={Colors.background} />
          <Text className="text-lg font-bold" style={{ color: Colors.background }}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
