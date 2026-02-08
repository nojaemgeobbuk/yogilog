import { View, Text, Image, Pressable, Dimensions, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  interpolate,
  useAnimatedStyle,
  SharedValue,
} from "react-native-reanimated";
import { Clock } from "lucide-react-native";
import { YogaSession } from "@/types";
import { Colors } from "@/constants/Colors";
import { formatDateShort, formatDuration } from "@/utils/formatDate";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
export const CARD_WIDTH = SCREEN_WIDTH * 0.72;
export const CARD_HEIGHT = CARD_WIDTH * 1.35;

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

    // 입체적인 책장 넘기기 효과
    const scale = interpolate(scrollX.value, inputRange, [0.85, 1, 0.85], "clamp");
    const opacity = interpolate(scrollX.value, inputRange, [0.6, 1, 0.6], "clamp");
    const rotateY = interpolate(scrollX.value, inputRange, [25, 0, -25], "clamp");
    const translateX = interpolate(scrollX.value, inputRange, [-15, 0, 15], "clamp");

    return {
      transform: [
        { perspective: 1000 },
        { translateX },
        { scale },
        { rotateY: `${rotateY}deg` },
      ],
      opacity,
    };
  });

  const handlePress = () => {
    router.push(`/session/${session.id}`);
  };

  return (
    <Animated.View style={[styles.cardContainer, animatedStyle]}>
      <Pressable onPress={handlePress} style={styles.polaroidFrame}>
        {/* Photo Area */}
        <View style={styles.photoContainer}>
          {session.images.length > 0 ? (
            <Image
              source={{ uri: session.images[0] }}
              style={styles.photo}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderPhoto}>
              <Text style={styles.placeholderEmoji}>🧘</Text>
            </View>
          )}
        </View>

        {/* Caption Area - 폴라로이드 하단 캡션 */}
        <View style={styles.captionArea}>
          <Text style={styles.title} numberOfLines={1}>
            {session.title || "Untitled Session"}
          </Text>

          <View style={styles.metaRow}>
            <Text style={styles.dateText}>
              {formatDateShort(session.date)}
            </Text>
            <View style={styles.durationContainer}>
              <Clock size={12} color={Colors.textMuted} />
              <Text style={styles.durationText}>
                {formatDuration(session.duration)}
              </Text>
            </View>
          </View>

          <View style={styles.bottomRow}>
            <Text style={styles.intensityStars}>
              {"★".repeat(session.intensity)}
              {"☆".repeat(5 - session.intensity)}
            </Text>
            {session.hashtags && session.hashtags.length > 0 && (
              <Text style={styles.tagText} numberOfLines={1}>
                #{session.hashtags[0]}
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginHorizontal: 10,
  },
  polaroidFrame: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    padding: 12,
    paddingBottom: 20,
    // 그림자
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    // 테두리
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  photoContainer: {
    flex: 1,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  placeholderPhoto: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
  },
  placeholderEmoji: {
    fontSize: 64,
  },
  captionArea: {
    paddingTop: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  intensityStars: {
    fontSize: 12,
    color: Colors.primary,
    letterSpacing: 1,
  },
  tagText: {
    fontSize: 11,
    color: Colors.accent1,
    fontWeight: '500',
  },
});
