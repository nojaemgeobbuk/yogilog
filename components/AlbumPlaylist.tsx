import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { interpolate } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import {
  PracticeDeckCard,
  SinglePracticeCard,
  PracticeCardData,
  CARD_WIDTH,
  CARD_HEIGHT,
  CONTAINER_HEIGHT,
} from './PracticeDeckCard';

const { width } = Dimensions.get('window');

// YogaSession 타입 호환을 위한 인터페이스
interface YogaSession {
  id: string;
  title: string;
  date: string;
  duration: number;
  intensity: number;
  isFavorite: boolean;
  images?: string[];
  asanas?: { name: string }[];
  hashtags?: string[];
  note?: string;
  location?: string;
}

interface AlbumPlaylistProps {
  data: YogaSession[];
  onItemPress?: (session: YogaSession) => void;
}

/**
 * YogaSession을 PracticeCardData로 변환
 */
function toPracticeCardData(session: YogaSession): PracticeCardData {
  return {
    id: session.id,
    title: session.title,
    date: session.date,
    duration: session.duration,
    location: session.location,
    images: session.images || [],
    isFavorite: session.isFavorite,
    note: session.note,
  };
}

export function AlbumPlaylist({ data, onItemPress }: AlbumPlaylistProps) {
  const baseOptions = {
    vertical: false,
    width: CARD_WIDTH,
    height: CARD_HEIGHT + 24,
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

  // 빈 데이터
  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>📝</Text>
          <Text style={styles.emptyTitle}>No sessions yet</Text>
          <Text style={styles.emptySubtitle}>Start your yoga journey today!</Text>
        </View>
      </View>
    );
  }

  // 단일 카드
  if (data.length === 1) {
    return (
      <View style={styles.container}>
        <SinglePracticeCard
          item={toPracticeCardData(data[0])}
          onPress={() => handleCardPress(data[0])}
        />
      </View>
    );
  }

  // 3D 책장 넘기기 애니메이션
  const animationStyle = useCallback((value: number) => {
    'worklet';
    const safeValue = Math.max(-1, Math.min(1, value));

    const translateX = interpolate(
      safeValue,
      [-1, 0, 1],
      [-CARD_WIDTH * 0.55, 0, CARD_WIDTH * 0.55]
    );
    const scale = interpolate(safeValue, [-1, 0, 1], [0.88, 1, 0.88]);
    const rotateY = `${interpolate(safeValue, [-1, 0, 1], [30, 0, -30])}deg`;
    const opacity = interpolate(safeValue, [-1, 0, 1], [0.7, 1, 0.7]);

    return {
      transform: [
        { translateX },
        { scale },
        { perspective: 1200 },
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
        scrollAnimationDuration={350}
        customAnimation={animationStyle}
        renderItem={({ item }) => (
          <PracticeDeckCard
            item={toPracticeCardData(item)}
            onPress={() => handleCardPress(item)}
          />
        )}
      />
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
  emptyContainer: {
    height: CONTAINER_HEIGHT,
    minHeight: CONTAINER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    paddingHorizontal: 40,
  },
  emptyCard: {
    width: CARD_WIDTH,
    paddingVertical: 60,
    paddingHorizontal: 30,
    backgroundColor: Colors.background,
    borderRadius: 20,
    alignItems: 'center',
    // 그림자
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
});

export default AlbumPlaylist;
