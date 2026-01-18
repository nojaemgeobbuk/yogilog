import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { X, Camera, Calendar, Save, Minus, Plus } from "lucide-react-native";
import { useYogaStore } from "@/store/useYogaStore";
import { AsanaInput } from "@/components/AsanaInput";
import { Colors } from "@/constants/Colors";

export default function WriteModal() {
  const router = useRouter();
  const addSession = useYogaStore((state) => state.addSession);

  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [duration, setDuration] = useState(30);
  const [intensity, setIntensity] = useState(3);
  const [images, setImages] = useState<string[]>([]);
  const [asanas, setAsanas] = useState<string[]>([]);
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

  const handleSave = () => {
    addSession({
      title: title || `Session ${new Date().toLocaleDateString()}`,
      images,
      note,
      date: date.toISOString(),
      duration,
      intensity,
      hashtags,
      asanas,
    });
    router.back();
  };

  const formatDate = (d: Date) => {
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: Colors.background }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b" style={{ borderBottomColor: Colors.border }}>
        <Pressable onPress={() => router.back()} className="p-2">
          <X size={24} color={Colors.text} />
        </Pressable>
        <Text className="text-xl font-bold" style={{ color: Colors.text }}>
          New Session
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
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

        {/* Asanas */}
        <View className="mt-6">
          <Text className="text-sm font-medium mb-2" style={{ color: Colors.textMuted }}>
            ASANAS
          </Text>
          <AsanaInput value={asanas} onChange={setAsanas} />
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

        {/* Notes */}
        <View className="mt-6 mb-6">
          <Text className="text-sm font-medium mb-2" style={{ color: Colors.textMuted }}>
            NOTES
          </Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="How did you feel today?"
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className="px-4 py-3 rounded-xl text-base min-h-[120px]"
            style={{ backgroundColor: Colors.cardSolid, color: Colors.text }}
          />
        </View>
      </ScrollView>

      {/* Save Button */}
      <View className="px-4 pb-4 pt-2">
        <Pressable
          onPress={handleSave}
          className="flex-row items-center justify-center py-4 rounded-full gap-2"
          style={{ backgroundColor: Colors.accent }}
        >
          <Save size={24} color={Colors.background} />
          <Text className="text-lg font-bold" style={{ color: Colors.background }}>
            Save Session
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
