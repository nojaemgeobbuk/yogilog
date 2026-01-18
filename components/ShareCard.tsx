import { forwardRef } from "react";
import { View, Text, Image } from "react-native";
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
      <View
        ref={ref}
        className="w-80 rounded-3xl overflow-hidden"
        style={{ backgroundColor: Colors.background }}
      >
        {/* Cover Image */}
        {session.images.length > 0 ? (
          <Image
            source={{ uri: session.images[0] }}
            className="w-full h-80"
            resizeMode="cover"
          />
        ) : (
          <View
            className="w-full h-80 items-center justify-center"
            style={{ backgroundColor: Colors.cardSolid }}
          >
            <Text className="text-8xl">🧘</Text>
          </View>
        )}

        {/* Info */}
        <View className="p-5">
          <Text
            className="text-2xl font-bold mb-2"
            style={{ color: Colors.text }}
          >
            {session.title}
          </Text>

          <View className="flex-row items-center gap-3 mb-3">
            <Text style={{ color: Colors.textMuted }}>
              {formatDate(session.date)}
            </Text>
            <Text style={{ color: Colors.textMuted }}>•</Text>
            <Text style={{ color: Colors.accent }}>
              {formatDuration(session.duration)}
            </Text>
          </View>

          {/* Intensity stars */}
          <Text style={{ color: Colors.accent }} className="text-lg mb-3">
            {"★".repeat(session.intensity)}
            {"☆".repeat(5 - session.intensity)}
          </Text>

          {/* Hashtags */}
          {session.hashtags.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mb-4">
              {session.hashtags.map((tag, index) => (
                <View
                  key={index}
                  className="px-3 py-1 rounded-full"
                  style={{ backgroundColor: Colors.primary + "40" }}
                >
                  <Text style={{ color: Colors.primary }}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Branding */}
          <View className="flex-row items-center justify-center pt-3 border-t" style={{ borderTopColor: Colors.border }}>
            <Disc3 size={18} color={Colors.accent} />
            <Text className="ml-2 font-bold" style={{ color: Colors.textMuted }}>
              Yogilog
            </Text>
          </View>
        </View>
      </View>
    );
  }
);

ShareCard.displayName = "ShareCard";
