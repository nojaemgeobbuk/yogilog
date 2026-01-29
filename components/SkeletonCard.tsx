import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.65;
const CARD_HEIGHT = CARD_WIDTH * 1.1;

interface SkeletonCardProps {
  style?: object;
}

export function SkeletonCard({ style }: SkeletonCardProps) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      shimmer.value,
      [0, 0.5, 1],
      [0.4, 0.7, 0.4]
    );
    return { opacity };
  });

  return (
    <Animated.View style={[styles.container, style, animatedStyle]}>
      {/* Image area skeleton */}
      <View style={styles.imageSkeleton} />

      {/* Text overlay skeleton */}
      <View style={styles.textOverlay}>
        <View style={styles.titleSkeleton} />
        <View style={styles.dateSkeleton} />
      </View>
    </Animated.View>
  );
}

// Multiple skeleton cards for deck effect
export function SkeletonDeck() {
  return (
    <View style={styles.deckContainer}>
      {/* Background cards for depth */}
      <View style={[styles.deckCard, styles.deckBack2]}>
        <SkeletonCard />
      </View>
      <View style={[styles.deckCard, styles.deckBack1]}>
        <SkeletonCard />
      </View>
      {/* Front card */}
      <View style={styles.deckCard}>
        <SkeletonCard />
      </View>
      {/* Indicator skeleton */}
      <View style={styles.indicatorSkeleton} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    backgroundColor: Colors.background,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  imageSkeleton: {
    flex: 1,
    backgroundColor: Colors.skeleton,
  },
  textOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingTop: 48,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  titleSkeleton: {
    height: 24,
    width: '70%',
    backgroundColor: Colors.skeleton,
    borderRadius: 8,
    marginBottom: 10,
  },
  dateSkeleton: {
    height: 16,
    width: '50%',
    backgroundColor: Colors.skeleton,
    borderRadius: 6,
  },
  deckContainer: {
    height: CARD_HEIGHT + 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deckCard: {
    position: 'absolute',
  },
  deckBack2: {
    transform: [{ translateY: -12 }, { scale: 0.92 }],
    opacity: 0.5,
  },
  deckBack1: {
    transform: [{ translateY: -6 }, { scale: 0.96 }],
    opacity: 0.7,
  },
  indicatorSkeleton: {
    position: 'absolute',
    bottom: 0,
    width: 40,
    height: 4,
    backgroundColor: Colors.skeleton,
    borderRadius: 2,
  },
});

export default SkeletonCard;
