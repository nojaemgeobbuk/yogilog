import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Plus, Disc3 } from "lucide-react-native";
import { Carousel } from "@/components/Carousel";
import { useYogaStore } from "@/store/useYogaStore";
import { Colors } from "@/constants/Colors";

export default function HomeScreen() {
  const router = useRouter();
  const sessions = useYogaStore((state) => state.sessions);

  const handleAddSession = () => {
    router.push("/(modals)/write");
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: Colors.background }}
    >
      {/* Header */}
      <View className="px-6 pt-4 pb-2">
        <View className="flex-row items-center gap-2 mb-1">
          <Disc3 size={28} color={Colors.accent} />
          <Text
            className="text-3xl font-bold"
            style={{ color: Colors.text }}
          >
            Yogilog
          </Text>
        </View>
        <Text style={{ color: Colors.textMuted }} className="text-base">
          Your yoga playlist • {sessions.length} sessions
        </Text>
      </View>

      {/* Carousel */}
      <View className="flex-1 justify-center">
        <Carousel sessions={sessions} />
      </View>

      {/* Add Button */}
      <View className="px-6 pb-4">
        <Pressable
          onPress={handleAddSession}
          className="flex-row items-center justify-center py-4 rounded-full gap-2"
          style={{ backgroundColor: Colors.primary }}
        >
          <Plus size={24} color={Colors.text} />
          <Text className="text-lg font-bold" style={{ color: Colors.text }}>
            New Session
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
