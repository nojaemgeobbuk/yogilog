import React, { memo, useRef, useState, useCallback, useEffect } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import Svg, { Path, Circle, G, Ellipse } from 'react-native-svg'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  withSpring,
  runOnJS,
} from 'react-native-reanimated'
import ConfettiCannon from 'react-native-confetti-cannon'
import { Colors } from '@/constants/Colors'
import type { GrowthLevel, GrowthData } from '@/hooks/useAsanaGrowthLevel'

interface AsanaGrowthTreeProps {
  data: GrowthData | null
  isLoading?: boolean
  size?: 'small' | 'medium' | 'large'
  showLabel?: boolean
  onPress?: () => void
  /** 레벨업 시 confetti 표시 여부 */
  showConfetti?: boolean
}

// 레벨별 색상 설정
const LEVEL_COLORS = {
  1: {
    trunk: '#8B7355', // 갈색 줄기
    leaves: '#A8D5BA', // 연한 초록
    accent: Colors.secondary, // 흙색
  },
  2: {
    trunk: '#8B7355',
    leaves: '#7CB87C', // 초록
    accent: '#A8D5BA',
  },
  3: {
    trunk: '#8B7355',
    leaves: Colors.accent1, // Seafoam green (#8FB9B8)
    accent: '#FFB7C5', // 연한 핑크 (꽃봉오리)
  },
  4: {
    trunk: '#8B7355',
    leaves: '#8FB9B8',
    accent: '#FF9EAD', // 핑크
  },
  5: {
    trunk: '#8B7355',
    leaves: '#FFB7C5', // 벚꽃 핑크
    accent: Colors.primary, // Terracotta orange (#E88D67)
  },
} as const

// 레벨별 라벨
const LEVEL_LABELS = {
  1: '새싹',
  2: '어린 나무',
  3: '꽃봉오리',
  4: '개화',
  5: '만개',
} as const

// 크기별 SVG 사이즈
const SIZE_CONFIG = {
  small: { width: 32, height: 32, viewBox: '0 0 48 48' },
  medium: { width: 64, height: 64, viewBox: '0 0 48 48' },
  large: { width: 120, height: 120, viewBox: '0 0 48 48' },
} as const

/**
 * Level 1: 새싹 - 흙 위로 작은 새싹이 돋아남
 */
const Level1Sprout = memo(() => (
  <G>
    {/* 흙 */}
    <Ellipse cx="24" cy="42" rx="16" ry="4" fill={Colors.secondary} />
    {/* 줄기 */}
    <Path
      d="M24 40 Q24 35 24 32"
      stroke="#7CB87C"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    {/* 잎 1 */}
    <Path
      d="M24 32 Q20 28 22 24 Q24 28 24 32"
      fill="#A8D5BA"
    />
    {/* 잎 2 */}
    <Path
      d="M24 32 Q28 28 26 24 Q24 28 24 32"
      fill="#7CB87C"
    />
  </G>
))

/**
 * Level 2: 어린 나무 - 작은 가지가 생김
 */
const Level2YoungTree = memo(() => (
  <G>
    {/* 흙 */}
    <Ellipse cx="24" cy="44" rx="14" ry="3" fill={Colors.secondary} />
    {/* 줄기 */}
    <Path
      d="M24 44 L24 28"
      stroke="#8B7355"
      strokeWidth="3"
      strokeLinecap="round"
    />
    {/* 가지 왼쪽 */}
    <Path
      d="M24 32 Q18 28 16 24"
      stroke="#8B7355"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    {/* 가지 오른쪽 */}
    <Path
      d="M24 30 Q30 26 32 22"
      stroke="#8B7355"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    {/* 잎 클러스터 */}
    <Circle cx="16" cy="22" r="5" fill="#7CB87C" />
    <Circle cx="32" cy="20" r="5" fill="#A8D5BA" />
    <Circle cx="24" cy="18" r="6" fill="#7CB87C" />
  </G>
))

/**
 * Level 3: 꽃봉오리 - 가지가 풍성하고 꽃봉오리가 맺힘 (Seafoam green)
 */
const Level3Buds = memo(() => (
  <G>
    {/* 흙 */}
    <Ellipse cx="24" cy="45" rx="12" ry="2.5" fill={Colors.secondary} />
    {/* 줄기 */}
    <Path
      d="M24 45 L24 24"
      stroke="#8B7355"
      strokeWidth="4"
      strokeLinecap="round"
    />
    {/* 가지들 */}
    <Path d="M24 32 Q16 26 12 20" stroke="#8B7355" strokeWidth="2" fill="none" strokeLinecap="round" />
    <Path d="M24 28 Q32 22 36 16" stroke="#8B7355" strokeWidth="2" fill="none" strokeLinecap="round" />
    <Path d="M24 36 Q18 32 14 28" stroke="#8B7355" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <Path d="M24 34 Q30 30 34 26" stroke="#8B7355" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    {/* 잎 (Seafoam green) */}
    <Circle cx="12" cy="18" r="6" fill={Colors.accent1} />
    <Circle cx="36" cy="14" r="6" fill={Colors.accent1} />
    <Circle cx="24" cy="12" r="7" fill={Colors.accent1} />
    <Circle cx="14" cy="26" r="4" fill={Colors.accent1} opacity={0.8} />
    <Circle cx="34" cy="24" r="4" fill={Colors.accent1} opacity={0.8} />
    {/* 꽃봉오리 */}
    <Circle cx="10" cy="16" r="2" fill="#FFB7C5" />
    <Circle cx="38" cy="12" r="2" fill="#FFB7C5" />
    <Circle cx="24" cy="8" r="2.5" fill="#FFB7C5" />
    <Circle cx="16" cy="10" r="1.5" fill="#FFB7C5" />
    <Circle cx="32" cy="10" r="1.5" fill="#FFB7C5" />
  </G>
))

/**
 * Level 4: 개화 - 꽃이 피기 시작
 */
const Level4Blooming = memo(() => (
  <G>
    {/* 흙 */}
    <Ellipse cx="24" cy="46" rx="10" ry="2" fill={Colors.secondary} />
    {/* 줄기 */}
    <Path
      d="M24 46 L24 22"
      stroke="#8B7355"
      strokeWidth="4"
      strokeLinecap="round"
    />
    {/* 가지들 */}
    <Path d="M24 30 Q14 22 10 16" stroke="#8B7355" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <Path d="M24 26 Q34 18 38 12" stroke="#8B7355" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <Path d="M24 36 Q16 30 12 26" stroke="#8B7355" strokeWidth="2" fill="none" strokeLinecap="round" />
    <Path d="M24 34 Q32 28 36 24" stroke="#8B7355" strokeWidth="2" fill="none" strokeLinecap="round" />
    {/* 잎 배경 */}
    <Circle cx="10" cy="14" r="7" fill="#8FB9B8" opacity={0.6} />
    <Circle cx="38" cy="10" r="7" fill="#8FB9B8" opacity={0.6} />
    <Circle cx="24" cy="8" r="8" fill="#8FB9B8" opacity={0.6} />
    <Circle cx="12" cy="24" r="5" fill="#8FB9B8" opacity={0.5} />
    <Circle cx="36" cy="22" r="5" fill="#8FB9B8" opacity={0.5} />
    {/* 꽃들 */}
    <Circle cx="8" cy="12" r="3" fill="#FFB7C5" />
    <Circle cx="14" cy="8" r="2.5" fill="#FF9EAD" />
    <Circle cx="40" cy="8" r="3" fill="#FFB7C5" />
    <Circle cx="34" cy="6" r="2.5" fill="#FF9EAD" />
    <Circle cx="24" cy="4" r="3.5" fill="#FF9EAD" />
    <Circle cx="18" cy="6" r="2" fill="#FFB7C5" />
    <Circle cx="30" cy="6" r="2" fill="#FFB7C5" />
    <Circle cx="10" cy="22" r="2" fill="#FFB7C5" />
    <Circle cx="38" cy="20" r="2" fill="#FFB7C5" />
  </G>
))

/**
 * Level 5: 만개 - 벚꽃이 만개 (Terracotta orange 포인트)
 */
const Level5FullBloom = memo(() => (
  <G>
    {/* 흙 */}
    <Ellipse cx="24" cy="46" rx="10" ry="2" fill={Colors.secondary} />
    {/* 줄기 */}
    <Path
      d="M24 46 L24 20"
      stroke="#8B7355"
      strokeWidth="5"
      strokeLinecap="round"
    />
    {/* 가지들 */}
    <Path d="M24 28 Q12 18 6 12" stroke="#8B7355" strokeWidth="3" fill="none" strokeLinecap="round" />
    <Path d="M24 24 Q36 14 42 8" stroke="#8B7355" strokeWidth="3" fill="none" strokeLinecap="round" />
    <Path d="M24 36 Q14 28 10 24" stroke="#8B7355" strokeWidth="2" fill="none" strokeLinecap="round" />
    <Path d="M24 34 Q34 26 38 22" stroke="#8B7355" strokeWidth="2" fill="none" strokeLinecap="round" />
    {/* 꽃 구름 배경 */}
    <Ellipse cx="24" cy="10" rx="18" ry="10" fill="#FFB7C5" opacity={0.4} />
    <Ellipse cx="10" cy="18" rx="10" ry="8" fill="#FFB7C5" opacity={0.4} />
    <Ellipse cx="38" cy="16" rx="10" ry="8" fill="#FFB7C5" opacity={0.4} />
    {/* 벚꽃들 */}
    <Circle cx="4" cy="10" r="3" fill="#FFB7C5" />
    <Circle cx="10" cy="6" r="3.5" fill="#FF9EAD" />
    <Circle cx="18" cy="4" r="3" fill="#FFB7C5" />
    <Circle cx="24" cy="2" r="4" fill={Colors.primary} /> {/* Terracotta orange 포인트 */}
    <Circle cx="30" cy="4" r="3" fill="#FFB7C5" />
    <Circle cx="38" cy="6" r="3.5" fill="#FF9EAD" />
    <Circle cx="44" cy="10" r="3" fill="#FFB7C5" />
    <Circle cx="6" cy="16" r="2.5" fill="#FF9EAD" />
    <Circle cx="14" cy="12" r="3" fill={Colors.primary} /> {/* Terracotta orange */}
    <Circle cx="34" cy="10" r="3" fill={Colors.primary} /> {/* Terracotta orange */}
    <Circle cx="42" cy="14" r="2.5" fill="#FF9EAD" />
    <Circle cx="8" cy="22" r="2" fill="#FFB7C5" />
    <Circle cx="40" cy="20" r="2" fill="#FFB7C5" />
    {/* 꽃잎 떨어지는 효과 */}
    <Circle cx="16" cy="28" r="1.5" fill="#FFB7C5" opacity={0.6} />
    <Circle cx="32" cy="30" r="1.5" fill="#FFB7C5" opacity={0.6} />
    <Circle cx="20" cy="38" r="1" fill="#FFB7C5" opacity={0.4} />
    <Circle cx="28" cy="40" r="1" fill="#FFB7C5" opacity={0.4} />
  </G>
))

// 레벨별 SVG 컴포넌트 매핑
const LEVEL_COMPONENTS: Record<GrowthLevel, React.FC> = {
  1: Level1Sprout,
  2: Level2YoungTree,
  3: Level3Buds,
  4: Level4Blooming,
  5: Level5FullBloom,
}

/**
 * 아사나 성장 나무 컴포넌트
 */
export const AsanaGrowthTree = memo(({
  data,
  isLoading = false,
  size = 'medium',
  showLabel = false,
  onPress,
  showConfetti = false,
}: AsanaGrowthTreeProps) => {
  const confettiRef = useRef<ConfettiCannon>(null)
  const [showConfettiEffect, setShowConfettiEffect] = useState(false)
  const scale = useSharedValue(1)

  const sizeConfig = SIZE_CONFIG[size]

  const handlePress = useCallback(() => {
    // 눌렸을 때 살짝 튀는 애니메이션
    scale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 400 })
    )

    // confetti 효과 (showConfetti가 true이고 레벨이 높을 때)
    if (showConfetti && data && data.level >= 3) {
      setShowConfettiEffect(true)
      setTimeout(() => setShowConfettiEffect(false), 2000)
    }

    onPress?.()
  }, [onPress, showConfetti, data, scale])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  if (isLoading) {
    return (
      <View style={[styles.container, { width: sizeConfig.width, height: sizeConfig.height }]}>
        <View style={[styles.loadingPlaceholder, { width: sizeConfig.width, height: sizeConfig.height }]} />
      </View>
    )
  }

  if (!data) {
    return null
  }

  const TreeComponent = LEVEL_COMPONENTS[data.level]

  const content = (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Svg
        width={sizeConfig.width}
        height={sizeConfig.height}
        viewBox={sizeConfig.viewBox}
      >
        <TreeComponent />
      </Svg>
      {showLabel && (
        <Text style={styles.levelLabel}>
          Lv.{data.level} {LEVEL_LABELS[data.level]}
        </Text>
      )}
      {showConfettiEffect && (
        <ConfettiCannon
          ref={confettiRef}
          count={30}
          origin={{ x: sizeConfig.width / 2, y: 0 }}
          autoStart
          fadeOut
          explosionSpeed={200}
          fallSpeed={2000}
          colors={['#FFB7C5', '#FF9EAD', Colors.primary, Colors.accent1]}
        />
      )}
    </Animated.View>
  )

  if (onPress) {
    return (
      <Pressable onPress={handlePress}>
        {content}
      </Pressable>
    )
  }

  return content
})

/**
 * 라이브러리 카드용 컴팩트 성장 나무
 */
export const AsanaGrowthTreeCompact = memo(({
  data,
  isLoading = false,
}: {
  data: GrowthData | null
  isLoading?: boolean
}) => {
  if (isLoading || !data) {
    return null
  }

  const TreeComponent = LEVEL_COMPONENTS[data.level]

  return (
    <View style={styles.compactContainer}>
      <Svg width={28} height={28} viewBox="0 0 48 48">
        <TreeComponent />
      </Svg>
      <Text style={[
        styles.compactLevel,
        data.level >= 5 && styles.compactLevelMax
      ]}>
        Lv.{data.level}
      </Text>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingPlaceholder: {
    backgroundColor: Colors.borderLight,
    borderRadius: 8,
  },
  levelLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: -0.3,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  compactLevel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: -0.3,
  },
  compactLevelMax: {
    color: Colors.primary,
  },
})
