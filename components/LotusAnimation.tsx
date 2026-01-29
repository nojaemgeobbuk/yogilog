import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
  interpolateColor,
  Easing,
  useDerivedValue,
  SharedValue,
} from 'react-native-reanimated';
import Svg, { Path, Circle, G } from 'react-native-svg';

// Colors
const COLORS = {
  line: '#000000',
  seafoam: '#A3CBC4',
  terracotta: '#D98357',
  seafoamLight: '#C5DDD9',
  terracottaLight: '#E8B49A',
};

interface LotusAnimationProps {
  pullProgress: number; // 0 to 1
  isRefreshing: boolean;
  size?: number;
}

// Static petal path generator
const createPetalPath = (height: number, width: number, bend: number) => {
  return `
    M 0 -${height}
    C ${width} -${height * 0.6} ${width + bend} -${height * 0.2} 0 0
    C -${width + bend} -${height * 0.2} -${width} -${height * 0.6} 0 -${height}
    Z
  `;
};

export function LotusAnimation({
  pullProgress,
  isRefreshing,
  size = 80
}: LotusAnimationProps) {
  const progress = useSharedValue(pullProgress);
  const breathe = useSharedValue(1);

  // Update progress when pullProgress changes
  useEffect(() => {
    progress.value = withTiming(pullProgress, { duration: 150 });
  }, [pullProgress]);

  // Breathing animation when refreshing
  useEffect(() => {
    if (isRefreshing) {
      breathe.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      breathe.value = withTiming(1, { duration: 300 });
    }
  }, [isRefreshing]);

  // Derived values
  const petalOpenness = useDerivedValue(() => {
    return interpolate(progress.value, [0, 0.33, 0.66, 1], [0, 0.2, 0.7, 1]);
  });

  const colorBlend = useDerivedValue(() => {
    return interpolate(progress.value, [0, 0.5, 1], [0, 0.5, 1]);
  });

  // Container style with breathing
  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: breathe.value }],
      opacity: interpolate(progress.value, [0, 0.15], [0.4, 1]),
    };
  });

  // Inner petal styles (4 petals at 0, 90, 180, 270 degrees)
  const innerPetalAngles = [0, 90, 180, 270];

  // Outer petal styles (4 petals at 45, 135, 225, 315 degrees)
  const outerPetalAngles = [45, 135, 225, 315];

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View style={[styles.svgContainer, containerStyle]}>
        {/* Outer petals layer */}
        {outerPetalAngles.map((angle, index) => (
          <OuterPetalView
            key={`outer-${index}`}
            angle={angle}
            petalOpenness={petalOpenness}
            colorBlend={colorBlend}
            progress={progress}
            size={size}
          />
        ))}

        {/* Inner petals layer */}
        {innerPetalAngles.map((angle, index) => (
          <InnerPetalView
            key={`inner-${index}`}
            angle={angle}
            petalOpenness={petalOpenness}
            colorBlend={colorBlend}
            progress={progress}
            size={size}
          />
        ))}

        {/* Center circle */}
        <CenterCircle
          colorBlend={colorBlend}
          progress={progress}
          size={size}
        />
      </Animated.View>
    </View>
  );
}

// Inner petal component using Animated.View for rotation
interface PetalViewProps {
  angle: number;
  petalOpenness: SharedValue<number>;
  colorBlend: SharedValue<number>;
  progress: SharedValue<number>;
  size: number;
}

function InnerPetalView({ angle, petalOpenness, colorBlend, progress, size }: PetalViewProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const openness = petalOpenness.value;
    const spreadAngle = interpolate(openness, [0, 1], [0, 10]);
    const finalAngle = angle + (angle >= 180 ? -spreadAngle : spreadAngle);
    const opacity = interpolate(progress.value, [0, 0.2], [0.5, 1]);

    return {
      transform: [{ rotate: `${finalAngle}deg` }],
      opacity,
    };
  });

  // Calculate petal dimensions based on progress
  const petalStyle = useAnimatedStyle(() => {
    const openness = petalOpenness.value;
    const height = interpolate(openness, [0, 1], [25, 32]);
    const width = interpolate(openness, [0, 1], [8, 16]);

    return {
      width: width * 2,
      height: height,
    };
  });

  // Color interpolation
  const fillColor = useDerivedValue(() => {
    return interpolateColor(
      colorBlend.value,
      [0, 0.5, 1],
      [COLORS.seafoamLight, COLORS.seafoam, COLORS.terracottaLight]
    );
  });

  return (
    <Animated.View style={[styles.petalContainer, animatedStyle, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="-50 -50 100 100">
        <InnerPetalSvg
          petalOpenness={petalOpenness}
          fillColor={fillColor}
        />
      </Svg>
    </Animated.View>
  );
}

function OuterPetalView({ angle, petalOpenness, colorBlend, progress, size }: PetalViewProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const openness = petalOpenness.value;
    const spreadAngle = interpolate(openness, [0, 1], [0, 18]);
    const finalAngle = angle + (angle >= 180 ? -spreadAngle : spreadAngle);
    const opacity = interpolate(progress.value, [0, 0.3, 0.5], [0, 0.3, 0.9]);

    return {
      transform: [{ rotate: `${finalAngle}deg` }],
      opacity,
    };
  });

  const fillColor = useDerivedValue(() => {
    return interpolateColor(
      colorBlend.value,
      [0, 0.5, 1],
      [COLORS.seafoamLight, COLORS.terracottaLight, COLORS.terracotta]
    );
  });

  return (
    <Animated.View style={[styles.petalContainer, animatedStyle, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="-50 -50 100 100">
        <OuterPetalSvg
          petalOpenness={petalOpenness}
          fillColor={fillColor}
        />
      </Svg>
    </Animated.View>
  );
}

// SVG Petal components
interface PetalSvgProps {
  petalOpenness: SharedValue<number>;
  fillColor: SharedValue<string>;
}

function InnerPetalSvg({ petalOpenness, fillColor }: PetalSvgProps) {
  // For static SVG, we use fixed values and let the View handle animation
  // The openness affects shape through the parent's opacity/scale
  return (
    <G>
      <Path
        d="M 0 -30 C 14 -18 16 -6 0 0 C -16 -6 -14 -18 0 -30 Z"
        fill={COLORS.seafoam}
        stroke={COLORS.line}
        strokeWidth={1}
        strokeLinejoin="round"
      />
    </G>
  );
}

function OuterPetalSvg({ petalOpenness, fillColor }: PetalSvgProps) {
  return (
    <G>
      <Path
        d="M 0 -38 C 12 -19 14 -6 0 0 C -14 -6 -12 -19 0 -38 Z"
        fill={COLORS.terracottaLight}
        stroke={COLORS.line}
        strokeWidth={0.8}
        strokeLinejoin="round"
      />
    </G>
  );
}

// Center circle component
interface CenterProps {
  colorBlend: SharedValue<number>;
  progress: SharedValue<number>;
  size: number;
}

function CenterCircle({ colorBlend, progress, size }: CenterProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(progress.value, [0, 0.5, 1], [0.6, 0.8, 1]);
    return {
      transform: [{ scale }],
    };
  });

  return (
    <Animated.View style={[styles.centerContainer, animatedStyle, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="-50 -50 100 100">
        <Circle
          cx={0}
          cy={0}
          r={8}
          fill={COLORS.terracotta}
          stroke={COLORS.line}
          strokeWidth={1}
        />
        {/* Inner detail circles */}
        <Circle
          cx={0}
          cy={0}
          r={4}
          fill={COLORS.seafoam}
          stroke={COLORS.line}
          strokeWidth={0.5}
        />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  petalContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LotusAnimation;
