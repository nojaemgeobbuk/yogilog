import { View, Text } from "react-native";
import { Colors } from "@/constants/Colors";

interface DurationBarProps {
  duration: number;
  maxDuration?: number;
}

export function DurationBar({ duration, maxDuration = 90 }: DurationBarProps) {
  const progress = Math.min((duration / maxDuration) * 100, 100);

  const formatTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0
      ? `${hrs}:${mins.toString().padStart(2, "0")}`
      : `0:${mins.toString().padStart(2, "0")}`;
  };

  return (
    <View className="w-full">
      {/* Progress bar */}
      <View
        className="h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: Colors.border }}
      >
        <View
          className="h-full rounded-full"
          style={{
            width: `${progress}%`,
            backgroundColor: Colors.accent,
          }}
        />
      </View>

      {/* Time labels */}
      <View className="flex-row justify-between mt-2">
        <Text className="text-sm" style={{ color: Colors.textMuted }}>
          {formatTime(duration)}
        </Text>
        <Text className="text-sm" style={{ color: Colors.textMuted }}>
          {formatTime(maxDuration)}
        </Text>
      </View>
    </View>
  );
}
