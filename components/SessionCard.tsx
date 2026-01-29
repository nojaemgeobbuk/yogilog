import { View, Text, Image, Pressable, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  interpolate,
  useAnimatedStyle,
  SharedValue,
} from "react-native-reanimated";
import { Play, Clock } from "lucide-react-native";
import { YogaSession } from "@/types";
import { Colors } from "@/constants/Colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
export const CARD_WIDTH = SCREEN_WIDTH * 0.75;
export const CARD_HEIGHT = CARD_WIDTH * 1.2;

interface SessionCardProps {
  session: YogaSession;
  index: number;
  scrollX: SharedValue<number>;
}

export function SessionCard({ session, index, scrollX }: SessionCardProps) {
  const router = useRouter();

  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * CARD_WIDTH,
      index * CARD_WIDTH,
      (index + 1) * CARD_WIDTH,
    ];

    const scale = interpolate(scrollX.value, inputRange, [0.85, 1, 0.85], "clamp");
    const opacity = interpolate(scrollX.value, inputRange, [0.6, 1, 0.6], "clamp");
    const rotateY = interpolate(scrollX.value, inputRange, [15, 0, -15], "clamp");

    return {
      transform: [{ scale }, { perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      opacity,
    };
  });

  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const handlePress = () => {
    router.push(`/session/${session.id}`);
  };

  return (
    <Animated.View
      style={[
        {
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          marginHorizontal: 8,
        },
        animatedStyle,
      ]}
    >
      <Pressable
        onPress={handlePress}
        className="flex-1 rounded-3xl overflow-hidden"
        style={{ backgroundColor: Colors.cardSolid }}
      >
        {/* Album Cover */}
        <View className="flex-1 relative">
          {session.images.length > 0 ? (
            <Image
              source={{ uri: session.images[0] }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View
              className="w-full h-full items-center justify-center"
              style={{ backgroundColor: Colors.primary }}
            >
              <Text className="text-6xl">🧘</Text>
            </View>
          )}

          {/* Overlay gradient */}
          <View className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />

          {/* Play button overlay */}
          <View className="absolute inset-0 items-center justify-center">
            <View
              className="w-16 h-16 rounded-full items-center justify-center"
              style={{ backgroundColor: Colors.accent }}
            >
              <Play size={28} color={Colors.background} fill={Colors.background} />
            </View>
          </View>
        </View>

        {/* Info section */}
        <View className="p-4" style={{ backgroundColor: Colors.cardSolid }}>
          <Text
            className="text-xl font-bold mb-1"
            style={{ color: Colors.text }}
            numberOfLines={1}
          >
            {session.title || "Untitled Session"}
          </Text>

          <View className="flex-row items-center gap-2">
            <Clock size={14} color={Colors.textMuted} />
            <Text style={{ color: Colors.textMuted }} className="text-sm">
              {formatDuration(session.duration)}
            </Text>
            <Text style={{ color: Colors.textMuted }} className="text-sm">
              •
            </Text>
            <Text style={{ color: Colors.accent }} className="text-sm font-medium">
              {"★".repeat(session.intensity)}
              {"☆".repeat(5 - session.intensity)}
            </Text>
          </View>

          {session.hashtags.length > 0 && (
            <View className="flex-row flex-wrap gap-1 mt-2">
              {session.hashtags.slice(0, 3).map((tag, i) => (
                <View
                  key={i}
                  className="px-2 py-1 rounded-full"
                  style={{ backgroundColor: Colors.primary + "40" }}
                >
                  <Text style={{ color: Colors.primary }} className="text-xs">
                    #{tag}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}
