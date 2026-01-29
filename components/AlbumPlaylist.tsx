import React, { useCallback } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, Pressable } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import Animated, {
  interpolate,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Star } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { YogaSession } from '@/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.65;
const CARD_HEIGHT = CARD_WIDTH * 1.1;
const CONTAINER_HEIGHT = 420; // Fixed height to prevent clipping

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AlbumPlaylistProps {
  data: YogaSession[];
  onItemPress?: (session: YogaSession) => void;
}

// Single card rendering component (for when there's only 1 item)
function SingleCard({ item, onPress }: { item: YogaSession; onPress?: () => void }) {
  const coverImage = item.images?.[0];
  const dateInfo = `${item.date} · ${item.duration}min`;

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 200 });
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  return (
    <View style={styles.singleCardContainer}>
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[styles.cardWrapper, animatedStyle]}
      >
        <View style={styles.cardContainer}>
          {coverImage ? (
            <Image source={{ uri: coverImage }} style={styles.coverImage} resizeMode="cover" />
          ) : (
            <View style={[styles.coverImage, styles.placeholderCover]}>
              <Text style={styles.placeholderEmoji}>🧘</Text>
            </View>
          )}
          {item.isFavorite === true && (
            <View style={styles.favoriteIcon}>
              <Star size={20} color={Colors.primary} fill={Colors.primary} />
            </View>
          )}
          <View style={styles.textOverlay}>
            <Text style={styles.titleText} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.dateText}>{dateInfo}</Text>
          </View>
        </View>
      </AnimatedPressable>
      <View style={styles.activeIndicator} />
    </View>
  );
}

export function AlbumPlaylist({ data, onItemPress }: AlbumPlaylistProps) {
  const baseOptions = {
    vertical: false,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    style: {
      width: width,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
  };

  const handleCardPress = useCallback((item: YogaSession) => {
    if (item && item.id) {
      onItemPress?.(item);
    }
  }, [onItemPress]);

  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No sessions yet</Text>
      </View>
    );
  }

  if (data.length === 1) {
    return (
      <View style={styles.container}>
        <SingleCard
          item={data[0]}
          onPress={() => handleCardPress(data[0])}
        />
      </View>
    );
  }

  const animationStyle = useCallback((value: number) => {
    'worklet';
    const safeValue = Math.max(-1, Math.min(1, value));

    const translateX = interpolate(safeValue, [-1, 0, 1], [-CARD_WIDTH * 0.65, 0, CARD_WIDTH * 0.65]);
    const scale = interpolate(safeValue, [-1, 0, 1], [0.85, 1, 0.85]);
    const rotateY = `${interpolate(safeValue, [-1, 0, 1], [35, 0, -35])}deg`;
    const opacity = interpolate(safeValue, [-1, 0, 1], [0.7, 1, 0.7]);

    return {
      transform: [
        { translateX },
        { scale },
        { perspective: 1000 },
        { rotateY },
      ],
      opacity,
    };
  }, []);

  return (
    <View style={styles.container}>
      <Carousel
        {...baseOptions}
        loop={true}
        autoPlay={false}
        data={data}
        scrollAnimationDuration={300}
        customAnimation={animationStyle}
        renderItem={({ item }) => (
          <CarouselCard
            item={item}
            onPress={() => handleCardPress(item)}
          />
        )}
      />
    </View>
  );
}

// Carousel card component - using simple Pressable for reliability
function CarouselCard({ item, onPress }: { item: YogaSession; onPress: () => void }) {
  const coverImage = item.images?.[0];
  const dateInfo = `${item.date} · ${item.duration}min`;

  const pressScale = useSharedValue(1);

  const pressAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const handlePressIn = () => {
    pressScale.value = withTiming(0.95, { duration: 100 });
  };

  const handlePressOut = () => {
    pressScale.value = withSequence(
      withTiming(1.05, { duration: 150, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 100 })
    );
  };

  const handlePress = () => {
    // Simple direct call - no worklet context issues
    onPress();
  };

  return (
    <View style={styles.carouselCardOuter}>
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[styles.cardWrapper, pressAnimatedStyle]}
        delayLongPress={500}
      >
        <View style={styles.cardContainer}>
          {coverImage ? (
            <Image source={{ uri: coverImage }} style={styles.coverImage} resizeMode="cover" />
          ) : (
            <View style={[styles.coverImage, styles.placeholderCover]}>
              <Text style={styles.placeholderEmoji}>🧘</Text>
            </View>
          )}
          {item.isFavorite === true && (
            <View style={styles.favoriteIcon}>
              <Star size={20} color={Colors.primary} fill={Colors.primary} />
            </View>
          )}
          <View style={styles.textOverlay}>
            <Text style={styles.titleText} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.dateText}>{dateInfo}</Text>
          </View>
        </View>
      </AnimatedPressable>
      <View style={styles.activeIndicator} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: CONTAINER_HEIGHT,
    minHeight: CONTAINER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    overflow: 'visible',
  },
  carouselCardOuter: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT + 24,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  singleCardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT + 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    height: CONTAINER_HEIGHT,
    minHeight: CONTAINER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 16,
    letterSpacing: -0.5,
  },
  placeholderCover: {
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.9,
  },
  placeholderEmoji: {
    fontSize: 64,
  },
  favoriteIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: 6,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: Colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  textOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingTop: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    justifyContent: 'flex-end',
  },
  titleText: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  dateText: {
    color: Colors.textMuted,
    fontSize: 14,
    letterSpacing: -0.5,
  },
  activeIndicator: {
    width: 40,
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    marginTop: 16,
    alignSelf: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default AlbumPlaylist;
