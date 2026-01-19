import { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  Share2,
  Trash2,
  Calendar,
  Clock,
  Activity,
} from "lucide-react-native";
import { useYogaStore } from "@/store/useYogaStore";
import { DurationBar } from "@/components/DurationBar";
import { ShareCard } from "@/components/ShareCard";
import { shareViewAsImage } from "@/utils/share";
import { Colors } from "@/constants/Colors";

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // hydration 상태와 세션을 함께 구독
  const hasHydrated = useYogaStore((state) => state._hasHydrated);
  const session = useYogaStore((state) =>
    state.sessions.find((s) => s.id === id)
  );
  const deleteSession = useYogaStore((state) => state.deleteSession);

  const shareCardRef = useRef<View>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  // hydration 완료 후에만 리다이렉트 판단
  useEffect(() => {
    if (hasHydrated && !session && id) {
      router.replace("/");
    }
  }, [hasHydrated, session, id, router]);

  // hydration 중이면 로딩 표시
  if (!hasHydrated) {
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

  if (!session) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: Colors.background }}
      >
        <Text style={{ color: Colors.text }}>Session not found</Text>
      </SafeAreaView>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins} minutes`;
  };

  const handleShare = async () => {
    setShowShareModal(true);
    setTimeout(async () => {
      try {
        await shareViewAsImage(shareCardRef);
      } catch (error) {
        Alert.alert("Error", "Failed to share. Please try again.");
      }
      setShowShareModal(false);
    }, 500);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Session",
      "Are you sure you want to delete this session?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteSession(id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: Colors.background }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable onPress={() => router.back()} className="p-2">
          <ChevronLeft size={28} color={Colors.text} />
        </Pressable>
        <Text className="text-lg font-bold" style={{ color: Colors.text }}>
          Now Playing
        </Text>
        <Pressable onPress={handleDelete} className="p-2">
          <Trash2 size={24} color={Colors.primary} />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Album Art */}
        <View className="px-6 mt-4">
          <View className="rounded-3xl overflow-hidden shadow-2xl">
            {session.images.length > 0 ? (
              <Image
                source={{ uri: session.images[0] }}
                className="w-full aspect-square"
                resizeMode="cover"
              />
            ) : (
              <View
                className="w-full aspect-square items-center justify-center"
                style={{ backgroundColor: Colors.cardSolid }}
              >
                <Text className="text-[120px]">🧘</Text>
              </View>
            )}
          </View>
        </View>

        {/* Title & Info */}
        <View className="px-6 mt-6">
          <Text
            className="text-3xl font-bold mb-2"
            style={{ color: Colors.text }}
          >
            {session.title}
          </Text>

          <View className="flex-row items-center gap-2 mb-4">
            <Calendar size={16} color={Colors.textMuted} />
            <Text style={{ color: Colors.textMuted }}>
              {formatDate(session.date)}
            </Text>
          </View>

          {/* Duration Bar */}
          <View className="mb-6">
            <DurationBar duration={session.duration} />
          </View>

          {/* Stats Row */}
          <View className="flex-row justify-around py-4 rounded-2xl mb-6" style={{ backgroundColor: Colors.cardSolid }}>
            <View className="items-center">
              <Clock size={24} color={Colors.accent} />
              <Text className="text-lg font-bold mt-1" style={{ color: Colors.text }}>
                {formatDuration(session.duration)}
              </Text>
              <Text className="text-sm" style={{ color: Colors.textMuted }}>
                Duration
              </Text>
            </View>
            <View className="items-center">
              <Activity size={24} color={Colors.primary} />
              <Text className="text-lg font-bold mt-1" style={{ color: Colors.text }}>
                {session.intensity}/5
              </Text>
              <Text className="text-sm" style={{ color: Colors.textMuted }}>
                Intensity
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl">🧘</Text>
              <Text className="text-lg font-bold mt-1" style={{ color: Colors.text }}>
                {session.asanas.length}
              </Text>
              <Text className="text-sm" style={{ color: Colors.textMuted }}>
                Asanas
              </Text>
            </View>
          </View>

          {/* Hashtags */}
          {session.hashtags.length > 0 && (
            <View className="mb-6">
              <Text className="text-sm font-medium mb-2" style={{ color: Colors.textMuted }}>
                TAGS
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {session.hashtags.map((tag, index) => (
                  <View
                    key={index}
                    className="px-4 py-2 rounded-full"
                    style={{ backgroundColor: Colors.primary + "40" }}
                  >
                    <Text style={{ color: Colors.primary }}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Asanas */}
          {session.asanas.length > 0 && (
            <View className="mb-6">
              <Text className="text-sm font-medium mb-2" style={{ color: Colors.textMuted }}>
                ASANAS
              </Text>
              <View className="rounded-2xl overflow-hidden" style={{ backgroundColor: Colors.cardSolid }}>
                {session.asanas.map((asana, index) => (
                  <View
                    key={index}
                    className="flex-row items-center px-4 py-3 border-b"
                    style={{ borderBottomColor: Colors.border }}
                  >
                    <Text className="w-8 text-center" style={{ color: Colors.accent }}>
                      {index + 1}
                    </Text>
                    <Text className="flex-1" style={{ color: Colors.text }}>
                      {asana}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Notes (Lyrics section) */}
          {session.note && (
            <View className="mb-6">
              <Text className="text-sm font-medium mb-2" style={{ color: Colors.textMuted }}>
                NOTES
              </Text>
              <View className="p-4 rounded-2xl" style={{ backgroundColor: Colors.cardSolid }}>
                <Text className="text-base leading-6" style={{ color: Colors.text }}>
                  {session.note}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Share Button */}
      <View className="px-6 pb-4">
        <Pressable
          onPress={handleShare}
          className="flex-row items-center justify-center py-4 rounded-full gap-2"
          style={{ backgroundColor: Colors.accent }}
        >
          <Share2 size={24} color={Colors.background} />
          <Text className="text-lg font-bold" style={{ color: Colors.background }}>
            Share Card
          </Text>
        </Pressable>
      </View>

      {/* Share Modal (hidden, for view-shot capture) */}
      <Modal visible={showShareModal} transparent>
        <View className="flex-1 items-center justify-center bg-black/80">
          <ShareCard ref={shareCardRef} session={session} />
        </View>
      </Modal>
    </SafeAreaView>
  );
}
