import React, { useCallback } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, Pressable } from 'react-native';
import Animated, {
  interpolate,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Clock, MapPin, Star } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { formatDateShort, formatDuration } from '@/utils/formatDate';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;
const CARD_HEIGHT = CARD_WIDTH * 1.25;
const CONTAINER_HEIGHT = 460;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// 씨폼 그린 강조색
const SEAFOAM = Colors.seafoam;

export interface PracticeCardData {
  id: string;
  title: string;
  date: string;
  duration: number;
  location?: string;
  images: string[];
  isFavorite: boolean;
  note?: string;
}

interface PracticeDeckCardProps {
  item: PracticeCardData;
  onPress?: () => void;
}

/**
 * 카드 데크 스타일의 수련 기록 카드
 */
export function PracticeDeckCard({ item, onPress }: PracticeDeckCardProps) {
  const coverImage = item.images?.[0];
  const dateText = formatDateShort(item.date);
  const durationText = formatDuration(item.duration);
  const locationText = item.location || '';

  const pressScale = useSharedValue(1);

  const pressAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const handlePressIn = () => {
    pressScale.value = withTiming(0.96, { duration: 100 });
  };

  const handlePressOut = () => {
    pressScale.value = withSequence(
      withTiming(1.02, { duration: 150, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 100 })
    );
  };

  const handlePress = () => {
    onPress?.();
  };

  return (
    <View style={styles.cardOuter}>
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[styles.cardWrapper, pressAnimatedStyle]}
        delayLongPress={500}
      >
        <View style={styles.card}>
          {/* 사진 영역 (상단) */}
          <View style={styles.imageContainer}>
            {coverImage ? (
              <Image
                source={{ uri: coverImage }}
                style={styles.coverImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderEmoji}>🧘</Text>
              </View>
            )}

            {/* 날짜 배지 (우측 상단) */}
            <View style={styles.dateBadge}>
              <Text style={styles.dateBadgeText}>{dateText}</Text>
            </View>

            {/* 즐겨찾기 아이콘 (좌측 상단) */}
            {item.isFavorite && (
              <View style={styles.favoriteIcon}>
                <Star size={18} color={SEAFOAM} fill={SEAFOAM} />
              </View>
            )}
          </View>

          {/* 정보 영역 (하단) */}
          <View style={styles.infoContainer}>
            {/* 제목 */}
            <Text style={styles.title} numberOfLines={2}>
              {item.title || 'Untitled Session'}
            </Text>

            {/* 메타 정보 (하단) */}
            <View style={styles.metaRow}>
              {/* 수련 시간 (좌측) */}
              <View style={styles.metaItem}>
                <Clock size={14} color={SEAFOAM} />
                <Text style={styles.metaText}>{durationText}</Text>
              </View>

              {/* 수련 장소 (우측) */}
              {locationText ? (
                <View style={styles.metaItem}>
                  <MapPin size={14} color={SEAFOAM} />
                  <Text style={styles.metaText} numberOfLines={1}>
                    {locationText}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </AnimatedPressable>

      {/* 활성 인디케이터 */}
      <View style={styles.activeIndicator} />
    </View>
  );
}

/**
 * Carousel용 카드 컴포넌트 (애니메이션 스타일 적용)
 */
interface CarouselCardProps {
  item: PracticeCardData;
  onPress: () => void;
}

export function CarouselPracticeCard({ item, onPress }: CarouselCardProps) {
  return <PracticeDeckCard item={item} onPress={onPress} />;
}

/**
 * 단일 카드 컴포넌트 (카드가 1개일 때)
 */
export function SinglePracticeCard({ item, onPress }: CarouselCardProps) {
  return (
    <View style={styles.singleCardContainer}>
      <PracticeDeckCard item={item} onPress={onPress} />
    </View>
  );
}

// 내보내기용 상수
export { CARD_WIDTH, CARD_HEIGHT, CONTAINER_HEIGHT };

const styles = StyleSheet.create({
  cardOuter: {
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
  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Colors.background,
    // 그림자 효과
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
    // 테두리
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 72,
  },
  dateBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    // 그림자
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  dateBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: 0.5,
  },
  favoriteIcon: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 8,
    // 그림자
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  infoContainer: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '500',
    letterSpacing: -0.3,
  },
  activeIndicator: {
    width: 40,
    height: 4,
    backgroundColor: SEAFOAM,
    borderRadius: 2,
    marginTop: 16,
    alignSelf: 'center',
    // 그림자
    shadowColor: SEAFOAM,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default PracticeDeckCard;
