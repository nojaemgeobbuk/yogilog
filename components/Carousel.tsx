import { View, Text, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  SharedValue,
} from "react-native-reanimated";
import { SessionCard, CARD_WIDTH } from "./SessionCard";
import { YogaSession } from "@/types";
import { Colors } from "@/constants/Colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SPACING = (SCREEN_WIDTH - CARD_WIDTH) / 2;

interface CarouselProps {
  sessions: YogaSession[];
}

export function Carousel({ sessions }: CarouselProps) {
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  if (sessions.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-6xl mb-4">🎵</Text>
        <Text
          className="text-2xl font-bold text-center mb-2"
          style={{ color: Colors.text }}
        >
          No Sessions Yet
        </Text>
        <Text
          className="text-center text-base"
          style={{ color: Colors.textMuted }}
        >
          Start your yoga journey by adding your first session. Tap the + button
          below!
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingHorizontal: SPACING - 8,
          alignItems: "center",
        }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {sessions.map((session, index) => (
          <SessionCard
            key={session.id}
            session={session}
            index={index}
            scrollX={scrollX}
          />
        ))}
      </Animated.ScrollView>

      {/* Pagination dots */}
      <View className="flex-row justify-center items-center py-4 gap-2">
        {sessions.map((_, index) => (
          <PaginationDot key={index} index={index} scrollX={scrollX} />
        ))}
      </View>
    </View>
  );
}

interface PaginationDotProps {
  index: number;
  scrollX: SharedValue<number>;
}

function PaginationDot({ index, scrollX }: PaginationDotProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * (CARD_WIDTH + 16),
      index * (CARD_WIDTH + 16),
      (index + 1) * (CARD_WIDTH + 16),
    ];

    const width = interpolate(scrollX.value, inputRange, [8, 24, 8], "clamp");
    const opacity = interpolate(scrollX.value, inputRange, [0.4, 1, 0.4], "clamp");

    return {
      width,
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        {
          height: 8,
          borderRadius: 4,
          backgroundColor: Colors.accent,
        },
        animatedStyle,
      ]}
    />
  );
}
