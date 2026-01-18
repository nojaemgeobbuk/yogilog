import { Link, Stack } from "expo-router";
import { View, Text } from "react-native";
import { Colors } from "@/constants/Colors";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View
        className="flex-1 items-center justify-center p-5"
        style={{ backgroundColor: Colors.background }}
      >
        <Text className="text-6xl mb-4">🧘</Text>
        <Text
          className="text-xl font-bold mb-4"
          style={{ color: Colors.text }}
        >
          This screen doesn't exist.
        </Text>

        <Link href="/" asChild>
          <Text style={{ color: Colors.primary }} className="text-base">
            Go to home screen!
          </Text>
        </Link>
      </View>
    </>
  );
}
