import { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  Clock,
  Calendar,
  TrendingUp,
  Play,
  ChevronRight,
} from "lucide-react-native";
import { useYogaStore } from "@/store/useYogaStore";
import { YogaSession } from "@/types";
import { Colors } from "@/constants/Colors";

export default function AsanaDetailScreen() {
  const { asanaName } = useLocalSearchParams<{ asanaName: string }>();
  const router = useRouter();
  const sessions = useYogaStore((state) => state.sessions);

  const decodedName = decodeURIComponent(asanaName || "");

  const { sessionsWithAsana, stats } = useMemo(() => {
    const filtered = sessions.filter((session) =>
      session.asanas.includes(decodedName)
    );

    const sortedByDate = [...filtered].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const totalDuration = filtered.reduce((acc, s) => acc + s.duration, 0);
    const avgIntensity =
      filtered.length > 0
        ? filtered.reduce((acc, s) => acc + s.intensity, 0) / filtered.length
        : 0;

    const firstPracticed =
      filtered.length > 0
        ? [...filtered].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          )[0].date
        : null;

    const lastPracticed = sortedByDate[0]?.date || null;

    return {
      sessionsWithAsana: sortedByDate,
      stats: {
        totalPlays: filtered.length,
        totalDuration,
        avgIntensity: Math.round(avgIntensity * 10) / 10,
        firstPracticed,
        lastPracticed,
      },
    };
  }, [sessions, decodedName]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  const getAsanaInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: Colors.background }}
    >
      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={() => router.back()} className="p-2">
          <ChevronLeft size={28} color={Colors.text} />
        </Pressable>
        <Text
          className="flex-1 text-lg font-bold text-center"
          style={{ color: Colors.text }}
        >
          Artist
        </Text>
        <View className="w-12" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Hero Section */}
        <View className="px-6 items-center mt-4">
          <View
            className="w-40 h-40 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: Colors.primary }}
          >
            <Text
              className="text-7xl font-bold"
              style={{ color: Colors.background }}
            >
              {getAsanaInitial(decodedName)}
            </Text>
          </View>

          <Text
            className="text-3xl font-bold text-center mb-2"
            style={{ color: Colors.text }}
          >
            {decodedName}
          </Text>

          <Text style={{ color: Colors.textMuted }} className="text-base">
            {stats.totalPlays} {stats.totalPlays === 1 ? "Play" : "Plays"}
          </Text>
        </View>

        {/* Stats Grid */}
        <View className="px-6 mt-6">
          <View
            className="flex-row flex-wrap rounded-2xl overflow-hidden"
            style={{ backgroundColor: Colors.cardSolid }}
          >
            <View className="w-1/2 p-4 items-center border-r border-b" style={{ borderColor: Colors.border }}>
              <Play size={24} color={Colors.accent} />
              <Text className="text-xl font-bold mt-2" style={{ color: Colors.text }}>
                {stats.totalPlays}
              </Text>
              <Text className="text-sm" style={{ color: Colors.textMuted }}>
                Total Plays
              </Text>
            </View>

            <View className="w-1/2 p-4 items-center border-b" style={{ borderColor: Colors.border }}>
              <Clock size={24} color={Colors.primary} />
              <Text className="text-xl font-bold mt-2" style={{ color: Colors.text }}>
                {formatDuration(stats.totalDuration)}
              </Text>
              <Text className="text-sm" style={{ color: Colors.textMuted }}>
                Total Time
              </Text>
            </View>

            <View className="w-1/2 p-4 items-center border-r" style={{ borderColor: Colors.border }}>
              <TrendingUp size={24} color={Colors.accent} />
              <Text className="text-xl font-bold mt-2" style={{ color: Colors.text }}>
                {stats.avgIntensity}/5
              </Text>
              <Text className="text-sm" style={{ color: Colors.textMuted }}>
                Avg Intensity
              </Text>
            </View>

            <View className="w-1/2 p-4 items-center">
              <Calendar size={24} color={Colors.primary} />
              <Text className="text-xl font-bold mt-2" style={{ color: Colors.text }}>
                {stats.firstPracticed
                  ? formatDate(stats.firstPracticed)
                  : "N/A"}
              </Text>
              <Text className="text-sm" style={{ color: Colors.textMuted }}>
                First Played
              </Text>
            </View>
          </View>
        </View>

        {/* Sessions List */}
        <View className="px-6 mt-6">
          <Text className="text-lg font-bold mb-3" style={{ color: Colors.text }}>
            Discography
          </Text>

          {sessionsWithAsana.length === 0 ? (
            <View
              className="p-6 rounded-2xl items-center"
              style={{ backgroundColor: Colors.cardSolid }}
            >
              <Text className="text-4xl mb-2">📭</Text>
              <Text style={{ color: Colors.textMuted }}>
                No sessions found with this asana
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {sessionsWithAsana.map((session) => (
                <SessionListItem
                  key={session.id}
                  session={session}
                  onPress={() => router.push(`/session/${session.id}`)}
                  formatDuration={formatDuration}
                  formatDate={formatDate}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface SessionListItemProps {
  session: YogaSession;
  onPress: () => void;
  formatDuration: (minutes: number) => string;
  formatDate: (dateString: string) => string;
}

function SessionListItem({
  session,
  onPress,
  formatDuration,
  formatDate,
}: SessionListItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center p-3 rounded-2xl"
      style={{ backgroundColor: Colors.cardSolid }}
    >
      {/* Thumbnail */}
      {session.images.length > 0 ? (
        <Image
          source={{ uri: session.images[0] }}
          className="w-14 h-14 rounded-xl"
        />
      ) : (
        <View
          className="w-14 h-14 rounded-xl items-center justify-center"
          style={{ backgroundColor: Colors.primary }}
        >
          <Text className="text-2xl">🧘</Text>
        </View>
      )}

      {/* Info */}
      <View className="flex-1 ml-3">
        <Text
          className="text-base font-bold"
          style={{ color: Colors.text }}
          numberOfLines={1}
        >
          {session.title}
        </Text>
        <View className="flex-row items-center gap-2 mt-1">
          <Text className="text-sm" style={{ color: Colors.textMuted }}>
            {formatDate(session.date)}
          </Text>
          <Text style={{ color: Colors.textMuted }}>•</Text>
          <Text className="text-sm" style={{ color: Colors.accent }}>
            {formatDuration(session.duration)}
          </Text>
        </View>
      </View>

      {/* Arrow */}
      <ChevronRight size={20} color={Colors.textMuted} />
    </Pressable>
  );
}
