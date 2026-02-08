import React, { useEffect } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withDelay,
  interpolate,
  interpolateColor,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import Svg, { Path, G, Circle } from "react-native-svg";

const { width, height } = Dimensions.get("window");

// 애니메이션 가능한 SVG 컴포넌트
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedView = Animated.createAnimatedComponent(View);

// 색상 정의
const COLORS = {
  budColor: "#A3CBC4",      // 씨폼 그린 (봉오리)
  bloomColor: "#D98357",    // 테라코타 오렌지 (만개)
  strokeColor: "#000000",   // 블랙 라인
  background: "#FFFFFF",    // 배경
};

interface LotusSplashProps {
  onAnimationComplete: () => void;
}

// 개별 꽃잎 컴포넌트
interface PetalProps {
  progress: Animated.SharedValue<number>;
  index: number;
  totalPetals: number;
}

function Petal({ progress, index, totalPetals }: PetalProps) {
  // 각 꽃잎의 기본 각도 (균등 분포)
  const baseAngle = (index / totalPetals) * 360;

  // 꽃잎마다 약간의 지연 효과
  const delayFactor = index * 0.03;

  // 봉오리 상태에서의 각도 조정
  const budAngleOffset = -baseAngle + 180;

  // SVG 애니메이션 props
  const animatedProps = useAnimatedProps(() => {
    // progress에 따른 회전 각도
    const rotation = interpolate(
      progress.value,
      [0, 0.3 + delayFactor, 1],
      [budAngleOffset, budAngleOffset * 0.3, 0],
      "clamp"
    );

    // 꽃잎 스케일
    const scale = interpolate(
      progress.value,
      [0, 0.5 + delayFactor, 1],
      [0.6, 0.85, 1],
      "clamp"
    );

    // 꽃잎이 바깥으로 이동
    const translateY = interpolate(
      progress.value,
      [0, 0.4 + delayFactor, 1],
      [15, 5, 0],
      "clamp"
    );

    // 색상 보간
    const fillColor = interpolateColor(
      progress.value,
      [0, 0.5, 1],
      [COLORS.budColor, "#C9A07D", COLORS.bloomColor]
    );

    // 라인 두께
    const strokeWidth = interpolate(
      progress.value,
      [0, 1],
      [1, 1.8],
      "clamp"
    );

    // transform 문자열 생성
    const totalRotation = baseAngle + rotation;
    const transform = `rotate(${totalRotation}) translate(0, ${translateY}) scale(1, ${scale})`;

    return {
      fill: fillColor,
      strokeWidth,
      transform,
    };
  });

  return (
    <AnimatedPath
      d="M 0 -20
         C -15 -40, -20 -65, 0 -80
         C 20 -65, 15 -40, 0 -20 Z"
      stroke={COLORS.strokeColor}
      animatedProps={animatedProps}
    />
  );
}

function CenterCircle({ progress }: { progress: Animated.SharedValue<number> }) {
  const animatedProps = useAnimatedProps(() => {
    const scale = interpolate(
      progress.value,
      [0, 0.7, 1],
      [0.5, 0.8, 1],
      "clamp"
    );

    const fillColor = interpolateColor(
      progress.value,
      [0, 1],
      ["#7BA8A0", "#C4764A"]
    );

    const strokeWidth = interpolate(
      progress.value,
      [0, 1],
      [1, 1.5],
      "clamp"
    );

    return {
      r: 12 * scale,
      fill: fillColor,
      strokeWidth,
    };
  });

  return (
    <AnimatedCircle
      cx={0}
      cy={0}
      stroke={COLORS.strokeColor}
      animatedProps={animatedProps}
    />
  );
}

function LotusFlower({ progress }: { progress: Animated.SharedValue<number> }) {
  const petals = 8;
  const petalIndices = Array.from({ length: petals }, (_, i) => i);

  return (
    <Svg width={200} height={200} viewBox="-100 -100 200 200">
      <G>
        {/* 꽃잎들 */}
        {petalIndices.map((index) => (
          <Petal
            key={index}
            progress={progress}
            index={index}
            totalPetals={petals}
          />
        ))}
        {/* 중앙 원 */}
        <CenterCircle progress={progress} />
      </G>
    </Svg>
  );
}

export function LotusSplash({ onAnimationComplete }: LotusSplashProps) {
  const progress = useSharedValue(1); // 바로 완전히 핀 상태로 시작
  const fadeOut = useSharedValue(0);

  useEffect(() => {
    // 1.5초 동안 완전히 핀 연꽃을 보여준 후 페이드 아웃
    fadeOut.value = withDelay(
      1500,
      withTiming(1, {
        duration: 600,
        easing: Easing.out(Easing.ease),
      }, (finished) => {
        if (finished) {
          runOnJS(onAnimationComplete)();
        }
      })
    );
  }, []);

  // 연꽃 컨테이너 애니메이션
  const lotusContainerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      fadeOut.value,
      [0, 1],
      [1, 0],
      "clamp"
    );

    return {
      transform: [{ scale: 1 }],
      opacity,
    };
  });

  // 텍스트 애니메이션
  const textStyle = useAnimatedStyle(() => {
    const fadeOutOpacity = interpolate(
      fadeOut.value,
      [0, 1],
      [1, 0],
      "clamp"
    );

    return {
      opacity: fadeOutOpacity,
      transform: [{ translateY: 0 }],
    };
  });

  // 화이트 오버레이 (페이드 아웃 효과)
  const overlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      fadeOut.value,
      [0, 0.3, 1],
      [0, 0.3, 1],
      "clamp"
    );

    return {
      opacity,
    };
  });

  return (
    <View style={styles.container}>
      {/* 연꽃 애니메이션 */}
      <AnimatedView style={[styles.lotusContainer, lotusContainerStyle]}>
        <LotusFlower progress={progress} />
      </AnimatedView>

      {/* 앱 이름 */}
      <AnimatedView style={[styles.textContainer, textStyle]}>
        <Animated.Text style={styles.appName}>YOGILOG</Animated.Text>
      </AnimatedView>

      {/* 화이트 아웃 오버레이 */}
      <AnimatedView style={[styles.overlay, overlayStyle]} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  lotusContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    marginTop: 32,
  },
  appName: {
    fontSize: 24,
    fontWeight: "300",
    letterSpacing: 8,
    color: "#000000",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background,
  },
});
