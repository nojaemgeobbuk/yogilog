import React, { useEffect, useRef, useCallback } from "react";
import { View, Text, Modal, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  runOnJS,
  Easing,
  withTiming,
} from "react-native-reanimated";
import ConfettiCannon from "react-native-confetti-cannon";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/Colors";
import { Badge, TIER_COLORS, getBadgeById } from "@/constants/Badges";

interface BadgeCelebrationModalProps {
  visible: boolean;
  badgeIds: string[];
  onClose: () => void;
}

export function BadgeCelebrationModal({
  visible,
  badgeIds,
  onClose,
}: BadgeCelebrationModalProps) {
  const confettiRef = useRef<ConfettiCannon>(null);

  // Reanimated shared values
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);
  const iconScale = useSharedValue(0.8);
  const contentOpacity = useSharedValue(0);

  const badges = badgeIds
    .map((id) => getBadgeById(id))
    .filter((b): b is Badge => b !== undefined);

  // 햅틱 피드백 트리거
  const triggerHaptic = useCallback(async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.log('[BadgeCelebration] Haptics not available');
    }
  }, []);

  // 폭죽 시작
  const startConfetti = useCallback(() => {
    confettiRef.current?.start();
  }, []);

  useEffect(() => {
    if (visible && badges.length > 0) {
      // 초기값 리셋
      scale.value = 0;
      rotation.value = 0;
      iconScale.value = 0.8;
      contentOpacity.value = 0;

      // 햅틱 피드백
      triggerHaptic();

      // 메인 컨텐츠 페이드 인
      contentOpacity.value = withTiming(1, { duration: 300 });

      // Pop 애니메이션 (0.8 → 1.2 → 1.0)
      scale.value = withSequence(
        withSpring(0.8, { damping: 10, stiffness: 100 }),
        withSpring(1.2, { damping: 8, stiffness: 150 }),
        withSpring(1, { damping: 12, stiffness: 100 })
      );

      // 아이콘 Pop 애니메이션 (조금 딜레이)
      iconScale.value = withDelay(
        200,
        withSequence(
          withSpring(0.8, { damping: 8, stiffness: 100 }),
          withSpring(1.2, { damping: 6, stiffness: 180 }),
          withSpring(1, { damping: 10, stiffness: 120 })
        )
      );

      // 회전 애니메이션 (약간의 흔들림)
      rotation.value = withDelay(
        300,
        withSequence(
          withTiming(-10, { duration: 100, easing: Easing.ease }),
          withTiming(10, { duration: 100, easing: Easing.ease }),
          withTiming(-5, { duration: 80, easing: Easing.ease }),
          withTiming(5, { duration: 80, easing: Easing.ease }),
          withTiming(0, { duration: 60, easing: Easing.ease })
        )
      );

      // 폭죽 시작 (애니메이션 후)
      setTimeout(() => {
        runOnJS(startConfetti)();
      }, 400);
    }
  }, [visible, badges.length, scale, rotation, iconScale, contentOpacity, triggerHaptic, startConfetti]);

  // 메인 컨테이너 애니메이션 스타일
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: contentOpacity.value,
  }));

  // 아이콘 애니메이션 스타일 (Pop effect)
  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: iconScale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  if (badges.length === 0) return null;

  const displayBadge = badges[0];
  const BadgeIcon = displayBadge.icon;
  const tierColor = TIER_COLORS[displayBadge.tier];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <Pressable style={styles.container} onPress={onClose}>
          {/* Confetti */}
          <ConfettiCannon
            ref={confettiRef}
            count={200}
            origin={{ x: -10, y: 0 }}
            fadeOut
            autoStart={false}
            colors={[Colors.primary, "#FFD700", "#4ECDC4", "#FF6B6B", "#F2E8DF", "#98D8C8"]}
            explosionSpeed={400}
            fallSpeed={3000}
          />

          <Pressable style={styles.contentWrapper} onPress={(e) => e.stopPropagation()}>
            <Animated.View style={[styles.content, containerAnimatedStyle]}>
          {/* 축하 메시지 */}
          <Text style={styles.congratsText}>🎉 축하합니다!</Text>
          <Text style={styles.subtitleText}>새로운 뱃지를 획득하셨습니다</Text>

          {/* Badge Icon with Pop Animation */}
          <Animated.View style={[styles.badgeContainer, iconAnimatedStyle]}>
            <View
              style={[
                styles.badgeCircle,
                {
                  backgroundColor: displayBadge.color + "20",
                  borderColor: displayBadge.color,
                },
              ]}
            >
              <BadgeIcon size={64} color={displayBadge.color} />
            </View>
          </Animated.View>

          {/* Tier Badge */}
          <View style={[styles.tierBadge, { backgroundColor: tierColor.background }]}>
            <Text style={[styles.tierText, { color: tierColor.text }]}>
              {displayBadge.tier.toUpperCase()}
            </Text>
          </View>

          {/* Badge Name */}
          <Text style={styles.badgeTitle}>{displayBadge.title}</Text>

          {/* Badge Description */}
          <Text style={styles.badgeDescription}>{displayBadge.description}</Text>

          {/* Additional badges */}
          {badges.length > 1 && (
            <Text style={styles.additionalText}>
              +{badges.length - 1}개의 뱃지를 더 획득했습니다!
            </Text>
          )}

            {/* Close Button */}
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.closeButtonPressed,
              ]}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <Text style={styles.closeButtonText}>확인</Text>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Pressable>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.97)",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  contentWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  congratsText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 16,
    marginBottom: 32,
    color: Colors.textMuted,
    letterSpacing: -0.5,
  },
  badgeContainer: {
    marginBottom: 20,
  },
  badgeCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    // 그림자 효과
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  tierBadge: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 9999,
    marginBottom: 12,
  },
  tierText: {
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  badgeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  badgeDescription: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
    color: Colors.textMuted,
    letterSpacing: -0.5,
    lineHeight: 24,
  },
  additionalText: {
    fontSize: 14,
    marginBottom: 20,
    color: Colors.primary,
    fontWeight: "600",
    letterSpacing: -0.5,
  },
  closeButton: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 9999,
    backgroundColor: Colors.primary,
    // 그림자 효과
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  closeButtonPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.background,
    letterSpacing: -0.5,
  },
});
