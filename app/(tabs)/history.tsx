import { useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Calendar as RNCalendar, DateData } from "react-native-calendars";
import { Calendar as CalendarIcon, Clock, ChevronRight } from "lucide-react-native";
import { useYogaStore } from "@/store/useYogaStore";
import { YogaSession } from "@/types";
import { Colors } from "@/constants/Colors";

export default function HistoryScreen() {
  const router = useRouter();
  const sessions = useYogaStore((state) => state.sessions);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};

    sessions.forEach((session) => {
      const dateKey = session.date.split("T")[0];
      marks[dateKey] = {
        marked: true,
        dotColor: Colors.accent,
        customStyles: {
          container: {
            backgroundColor: Colors.primary + "40",
            borderRadius: 8,
          },
          text: {
            color: Colors.text,
            fontWeight: "bold",
          },
        },
      };
    });

    if (selectedDate) {
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: Colors.primary,
      };
    }

    return marks;
  }, [sessions, selectedDate]);

  const sessionsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return sessions.filter(
      (session) => session.date.split("T")[0] === selectedDate
    );
  }, [sessions, selectedDate]);

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  const totalSessions = sessions.length;
  const totalMinutes = sessions.reduce((acc, s) => acc + s.duration, 0);
  const totalHours = Math.floor(totalMinutes / 60);

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: Colors.background }}
    >
      {/* Header */}
      <View className="px-6 pt-4 pb-2">
        <View className="flex-row items-center gap-2 mb-1">
          <CalendarIcon size={28} color={Colors.accent} />
          <Text className="text-3xl font-bold" style={{ color: Colors.text }}>
            History
          </Text>
        </View>
        <Text style={{ color: Colors.textMuted }} className="text-base">
          {totalSessions} sessions • {totalHours}h {totalMinutes % 60}m total
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Calendar */}
        <View className="px-4 mt-4">
          <RNCalendar
            onDayPress={handleDayPress}
            markedDates={markedDates}
            markingType="custom"
            theme={{
              calendarBackground: Colors.cardSolid,
              textSectionTitleColor: Colors.textMuted,
              selectedDayBackgroundColor: Colors.primary,
              selectedDayTextColor: Colors.text,
              todayTextColor: Colors.accent,
              dayTextColor: Colors.text,
              textDisabledColor: Colors.textMuted + "60",
              monthTextColor: Colors.text,
              arrowColor: Colors.accent,
              textDayFontWeight: "500",
              textMonthFontWeight: "bold",
              textDayHeaderFontWeight: "600",
            }}
            style={{
              borderRadius: 16,
              overflow: "hidden",
            }}
          />
        </View>

        {/* Sessions for selected date */}
        {selectedDate && (
          <View className="px-4 mt-6 mb-6">
            <Text
              className="text-lg font-bold mb-3"
              style={{ color: Colors.text }}
            >
              {sessionsForSelectedDate.length > 0
                ? `${sessionsForSelectedDate.length} Session${
                    sessionsForSelectedDate.length > 1 ? "s" : ""
                  }`
                : "No sessions"}
            </Text>

            {sessionsForSelectedDate.length === 0 ? (
              <View
                className="p-6 rounded-2xl items-center"
                style={{ backgroundColor: Colors.cardSolid }}
              >
                <Text className="text-4xl mb-2">📭</Text>
                <Text style={{ color: Colors.textMuted }}>
                  No yoga sessions on this day
                </Text>
              </View>
            ) : (
              <View className="gap-3">
                {sessionsForSelectedDate.map((session) => (
                  <SessionListItem
                    key={session.id}
                    session={session}
                    onPress={() => router.push(`/session/${session.id}`)}
                    formatDuration={formatDuration}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Recent sessions */}
        {!selectedDate && sessions.length > 0 && (
          <View className="px-4 mt-6 mb-6">
            <Text
              className="text-lg font-bold mb-3"
              style={{ color: Colors.text }}
            >
              Recent Sessions
            </Text>
            <View className="gap-3">
              {sessions.slice(0, 5).map((session) => (
                <SessionListItem
                  key={session.id}
                  session={session}
                  onPress={() => router.push(`/session/${session.id}`)}
                  formatDuration={formatDuration}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

interface SessionListItemProps {
  session: YogaSession;
  onPress: () => void;
  formatDuration: (minutes: number) => string;
}

function SessionListItem({
  session,
  onPress,
  formatDuration,
}: SessionListItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center p-3 rounded-2xl"
      style={{ backgroundColor: Colors.cardSolid }}
    >
      {/* Thumbnail */}
      {session.images.length > 0 ? (
        <Image
          source={{ uri: session.images[0] }}
          className="w-14 h-14 rounded-xl"
        />
      ) : (
        <View
          className="w-14 h-14 rounded-xl items-center justify-center"
          style={{ backgroundColor: Colors.primary }}
        >
          <Text className="text-2xl">🧘</Text>
        </View>
      )}

      {/* Info */}
      <View className="flex-1 ml-3">
        <Text
          className="text-base font-bold"
          style={{ color: Colors.text }}
          numberOfLines={1}
        >
          {session.title}
        </Text>
        <View className="flex-row items-center gap-2 mt-1">
          <Clock size={12} color={Colors.textMuted} />
          <Text className="text-sm" style={{ color: Colors.textMuted }}>
            {formatDuration(session.duration)}
          </Text>
          <Text style={{ color: Colors.accent }} className="text-sm">
            {"★".repeat(session.intensity)}
          </Text>
        </View>
      </View>

      {/* Arrow */}
      <ChevronRight size={20} color={Colors.textMuted} />
    </Pressable>
  );
}
