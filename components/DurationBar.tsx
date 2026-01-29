import { View, Text, StyleSheet } from "react-native";
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
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.track}>
        <View
          style={[
            styles.progress,
            { width: `${progress}%` },
          ]}
        />
      </View>

      {/* Time labels */}
      <View style={styles.labels}>
        <Text style={styles.labelText}>{formatTime(duration)}</Text>
        <Text style={styles.labelText}>{formatTime(maxDuration)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: Colors.secondary,  // Beige track
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  progress: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: Colors.primary,  // Apricot progress
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  labelText: {
    fontSize: 14,
    color: Colors.textMuted,
    letterSpacing: -0.5,
  },
});
