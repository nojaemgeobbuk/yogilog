import { forwardRef } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Disc3, Circle } from "lucide-react-native";
import Svg, { Path, Circle as SvgCircle, G } from "react-native-svg";
import { Colors } from "@/constants/Colors";

interface ShareCardProps {
  session: {
    title: string;
    date: string;
    duration: number;
    intensity: number;
    images?: string[];
    asanas?: Array<{ name: string }>;
  };
}

export const ShareCard = forwardRef<View, ShareCardProps>(
  ({ session }, ref) => {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    const formatDuration = (minutes: number) => {
      const hrs = Math.floor(minutes / 60);
      const mins = minutes % 60;
      if (hrs > 0) return `${hrs}h ${mins}m`;
      return `${mins} min`;
    };

    const maxAsanasToShow = 5;
    const asanas = session.asanas || [];
    const displayAsanas = asanas.slice(0, maxAsanasToShow);
    const remainingCount = asanas.length - maxAsanasToShow;

    return (
      <View ref={ref} style={styles.card}>
        {/* Cover Image */}
        {session.images && session.images.length > 0 ? (
          <Image
            source={{ uri: session.images[0] }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Svg width={140} height={140} viewBox="-100 -100 200 200">
              <G>
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                  <Path
                    key={i}
                    d="M 0 -20 C -15 -40, -20 -65, 0 -80 C 20 -65, 15 -40, 0 -20 Z"
                    fill="#D98357"
                    stroke="#000000"
                    strokeWidth={1.8}
                    transform={`rotate(${angle})`}
                  />
                ))}
                <SvgCircle cx={0} cy={0} r={12} fill="#C4764A" stroke="#000000" strokeWidth={1.5} />
              </G>
            </Svg>
          </View>
        )}

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{session.title}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{formatDate(session.date)}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.durationText}>{formatDuration(session.duration)}</Text>
          </View>

          {/* Intensity stars */}
          <Text style={styles.intensityStars}>
            {"★".repeat(session.intensity)}
            {"☆".repeat(5 - session.intensity)}
          </Text>

          {/* Asanas List (Compact) */}
          {asanas.length > 0 && (
            <View style={styles.asanasSection}>
              <Text style={styles.asanasTitle}>
                Poses ({asanas.length})
              </Text>
              <View style={styles.asanasList}>
                {displayAsanas.map((asanaLog, index) => (
                  <View key={index} style={styles.asanaItem}>
                    <Circle
                      size={4}
                      fill={Colors.primary}
                      color={Colors.primary}
                      style={styles.asanaBullet}
                    />
                    <Text style={styles.asanaText} numberOfLines={1}>
                      {asanaLog.name}
                    </Text>
                  </View>
                ))}
                {remainingCount > 0 && (
                  <Text style={styles.remainingText}>
                    외 {remainingCount}개
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Branding */}
          <View style={styles.branding}>
            <Disc3 size={18} color={Colors.primary} />
            <Text style={styles.brandText}>Yogilog</Text>
          </View>
        </View>
      </View>
    );
  }
);

ShareCard.displayName = "ShareCard";

const styles = StyleSheet.create({
  card: {
    width: 320,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  coverImage: {
    width: "100%",
    height: 320,
  },
  coverPlaceholder: {
    width: "100%",
    height: 320,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.secondary,
  },
  infoContainer: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  metaText: {
    color: Colors.textMuted,
    letterSpacing: -0.5,
  },
  metaDot: {
    color: Colors.textMuted,
  },
  durationText: {
    color: Colors.primary,
    fontWeight: "600",
    letterSpacing: -0.5,
  },
  intensityStars: {
    fontSize: 18,
    color: Colors.primary,
    marginBottom: 16,
  },
  // Asanas Section
  asanasSection: {
    marginBottom: 16,
  },
  asanasTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textMuted,
    marginBottom: 8,
    letterSpacing: -0.3,
    textTransform: "uppercase",
  },
  asanasList: {
    gap: 6,
  },
  asanaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  asanaBullet: {
    marginTop: 1,
  },
  asanaText: {
    fontSize: 14,
    color: Colors.text,
    letterSpacing: -0.3,
    flex: 1,
  },
  remainingText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontStyle: "italic",
    marginLeft: 12,
    marginTop: 4,
    letterSpacing: -0.3,
  },
  branding: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  brandText: {
    marginLeft: 10,
    fontWeight: "bold",
    color: Colors.textMuted,
    letterSpacing: -0.5,
  },
});
