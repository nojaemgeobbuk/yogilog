import { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Library as LibraryIcon, Search, TrendingUp } from "lucide-react-native";
import { useYogaStore } from "@/store/useYogaStore";
import { Colors } from "@/constants/Colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - 48 - CARD_GAP) / 2;

interface AsanaStats {
  name: string;
  count: number;
  lastPracticed: string;
}

export default function LibraryScreen() {
  const router = useRouter();
  const sessions = useYogaStore((state) => state.sessions);
  const [searchQuery, setSearchQuery] = useState("");

  const asanaStats = useMemo(() => {
    const statsMap = new Map<string, AsanaStats>();

    sessions.forEach((session) => {
      session.asanas.forEach((asana) => {
        const existing = statsMap.get(asana);
        if (existing) {
          existing.count += 1;
          if (session.date > existing.lastPracticed) {
            existing.lastPracticed = session.date;
          }
        } else {
          statsMap.set(asana, {
            name: asana,
            count: 1,
            lastPracticed: session.date,
          });
        }
      });
    });

    return Array.from(statsMap.values()).sort((a, b) => b.count - a.count);
  }, [sessions]);

  const filteredAsanas = useMemo(() => {
    if (!searchQuery.trim()) return asanaStats;
    const query = searchQuery.toLowerCase();
    return asanaStats.filter((asana) =>
      asana.name.toLowerCase().includes(query)
    );
  }, [asanaStats, searchQuery]);

  const totalAsanas = asanaStats.length;
  const totalPlays = asanaStats.reduce((acc, a) => acc + a.count, 0);

  const handleAsanaPress = (asanaName: string) => {
    router.push(`/library/${encodeURIComponent(asanaName)}`);
  };

  const getAsanaInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const getAsanaColor = (index: number) => {
    const colors = [
      Colors.primary,
      Colors.accent,
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
      "#DDA0DD",
    ];
    return colors[index % colors.length];
  };

  const renderAsanaCard = ({
    item,
    index,
  }: {
    item: AsanaStats;
    index: number;
  }) => (
    <Pressable
      onPress={() => handleAsanaPress(item.name)}
      className="rounded-2xl overflow-hidden"
      style={{
        width: CARD_WIDTH,
        marginBottom: CARD_GAP,
        marginRight: index % 2 === 0 ? CARD_GAP : 0,
      }}
    >
      {/* Visual */}
      <View
        className="aspect-square items-center justify-center"
        style={{ backgroundColor: getAsanaColor(index) }}
      >
        <Text className="text-5xl font-bold" style={{ color: Colors.background }}>
          {getAsanaInitial(item.name)}
        </Text>
        {index < 3 && (
          <View
            className="absolute top-2 right-2 px-2 py-1 rounded-full"
            style={{ backgroundColor: Colors.background + "80" }}
          >
            <Text className="text-xs font-bold" style={{ color: Colors.text }}>
              #{index + 1}
            </Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View className="p-3" style={{ backgroundColor: Colors.cardSolid }}>
        <Text
          className="font-bold text-base mb-1"
          style={{ color: Colors.text }}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text className="text-sm" style={{ color: Colors.textMuted }}>
          {item.count} {item.count === 1 ? "Play" : "Plays"}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: Colors.background }}
    >
      {/* Header */}
      <View className="px-6 pt-4 pb-2">
        <View className="flex-row items-center gap-2 mb-1">
          <LibraryIcon size={28} color={Colors.accent} />
          <Text className="text-3xl font-bold" style={{ color: Colors.text }}>
            Library
          </Text>
        </View>
        <Text style={{ color: Colors.textMuted }} className="text-base">
          {totalAsanas} asanas • {totalPlays} total plays
        </Text>
      </View>

      {/* Search Bar */}
      <View className="px-6 py-3">
        <View
          className="flex-row items-center px-4 py-3 rounded-xl"
          style={{ backgroundColor: Colors.cardSolid }}
        >
          <Search size={20} color={Colors.textMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search asanas..."
            placeholderTextColor={Colors.textMuted}
            className="flex-1 ml-3 text-base"
            style={{ color: Colors.text }}
          />
        </View>
      </View>

      {/* Grid */}
      {filteredAsanas.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          {asanaStats.length === 0 ? (
            <>
              <Text className="text-6xl mb-4">🎭</Text>
              <Text
                className="text-2xl font-bold text-center mb-2"
                style={{ color: Colors.text }}
              >
                No Asanas Yet
              </Text>
              <Text
                className="text-center text-base"
                style={{ color: Colors.textMuted }}
              >
                Start practicing and your asanas will appear here like your
                favorite artists!
              </Text>
            </>
          ) : (
            <>
              <Text className="text-6xl mb-4">🔍</Text>
              <Text
                className="text-xl font-bold text-center mb-2"
                style={{ color: Colors.text }}
              >
                No Results
              </Text>
              <Text
                className="text-center text-base"
                style={{ color: Colors.textMuted }}
              >
                No asanas match "{searchQuery}"
              </Text>
            </>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredAsanas}
          renderItem={renderAsanaCard}
          keyExtractor={(item) => item.name}
          numColumns={2}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 8,
            paddingBottom: 24,
          }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            asanaStats.length > 0 && !searchQuery ? (
              <View className="flex-row items-center gap-2 mb-4">
                <TrendingUp size={18} color={Colors.accent} />
                <Text className="font-bold" style={{ color: Colors.text }}>
                  Top Artists
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}
