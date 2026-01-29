import { forwardRef } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Disc3 } from "lucide-react-native";
import { YogaSession } from "@/types";
import { Colors } from "@/constants/Colors";

interface ShareCardProps {
  session: YogaSession;
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

    return (
      <View ref={ref} style={styles.card}>
        {/* Cover Image */}
        {session.images.length > 0 ? (
          <Image
            source={{ uri: session.images[0] }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Text style={{ fontSize: 96 }}>🧘</Text>
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

          {/* Hashtags */}
          {session.hashtags.length > 0 && (
            <View style={styles.tagsRow}>
              {session.hashtags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
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
    marginBottom: 14,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 19,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: {
    color: Colors.text,
    fontSize: 14,
    letterSpacing: -0.5,
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
