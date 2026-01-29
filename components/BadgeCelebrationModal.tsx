import React, { useEffect, useRef } from "react";
import { View, Text, Modal, Pressable, Animated, Easing, StyleSheet } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
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
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef<ConfettiCannon>(null);

  const badges = badgeIds
    .map((id) => getBadgeById(id))
    .filter((b): b is Badge => b !== undefined);

  useEffect(() => {
    if (visible && badges.length > 0) {
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);

      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.elastic(1),
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => {
        confettiRef.current?.start();
      }, 300);
    }
  }, [visible, badges.length]);

  if (badges.length === 0) return null;

  const displayBadge = badges[0];
  const BadgeIcon = displayBadge.icon;
  const tierColor = TIER_COLORS[displayBadge.tier];

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.container}>
        {/* Confetti */}
        <ConfettiCannon
          ref={confettiRef}
          count={150}
          origin={{ x: -10, y: 0 }}
          fadeOut
          autoStart={false}
          colors={[Colors.primary, "#FFD700", "#4ECDC4", "#FF6B6B", "#F2E8DF"]}
        />

        <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.congratsText}>Congratulations!</Text>
          <Text style={styles.subtitleText}>You've earned a new badge!</Text>

          {/* Badge Icon */}
          <Animated.View style={[styles.badgeContainer, { transform: [{ rotate: spin }] }]}>
            <View
              style={[
                styles.badgeCircle,
                {
                  backgroundColor: Colors.secondary,
                  borderColor: Colors.primary,
                },
              ]}
            >
              <BadgeIcon size={64} color={Colors.primary} />
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
              +{badges.length - 1} more badge(s) earned!
            </Text>
          )}

          {/* Close Button */}
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Got it!</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  content: {
    alignItems: "center",
  },
  congratsText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 16,
    marginBottom: 29,
    color: Colors.textMuted,
    letterSpacing: -0.5,
  },
  badgeContainer: {
    marginBottom: 19,
  },
  badgeCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
  },
  tierBadge: {
    paddingHorizontal: 19,
    paddingVertical: 5,
    borderRadius: 9999,
    marginBottom: 10,
  },
  tierText: {
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: -0.5,
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
    marginBottom: 29,
    paddingHorizontal: 38,
    color: Colors.textMuted,
    letterSpacing: -0.5,
  },
  additionalText: {
    fontSize: 14,
    marginBottom: 19,
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  closeButton: {
    paddingHorizontal: 38,
    paddingVertical: 14,
    borderRadius: 9999,
    backgroundColor: Colors.primary,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.background,
    letterSpacing: -0.5,
  },
});
