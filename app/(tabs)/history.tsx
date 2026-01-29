import { useMemo, useState, useCallback, memo } from "react";
import { View, Text, Pressable, ScrollView, Image, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Calendar as RNCalendar, DateData } from "react-native-calendars";
import { Calendar as CalendarIcon, Clock, ChevronRight } from "lucide-react-native";
import { Q } from "@nozbe/watermelondb";
import withObservables from "@nozbe/with-observables";
import { Colors } from "@/constants/Colors";
import {
  practiceLogsCollection,
  PracticeLog,
  PracticeLogPhoto,
} from "@/database";

// 세션 아이템 컴포넌트 (memo로 최적화)
interface SessionListItemProps {
  session: PracticeLog;
  firstImage: string | null;
  onPress: () => void;
  formatDuration: (minutes: number) => string;
}

const SessionListItem = memo(({
  session,
  firstImage,
  onPress,
  formatDuration,
}: SessionListItemProps) => {
  return (
    <Pressable onPress={onPress} style={styles.sessionItem}>
      {/* Thumbnail */}
      {firstImage ? (
        <Image
          source={{ uri: firstImage }}
          style={styles.thumbnail}
        />
      ) : (
        <View style={styles.thumbnailPlaceholder}>
          <Text style={{ fontSize: 24 }}>🧘</Text>
        </View>
      )}

      {/* Info */}
      <View style={styles.sessionInfo}>
        <Text style={styles.sessionTitle} numberOfLines={1}>
          {session.title}
        </Text>
        <View style={styles.sessionMeta}>
          <Clock size={12} color={Colors.textMuted} />
          <Text style={styles.metaText}>{formatDuration(session.duration)}</Text>
          <Text style={styles.intensityStars}>
            {"★".repeat(session.intensity)}
          </Text>
        </View>
      </View>

      {/* Arrow */}
      <ChevronRight size={20} color={Colors.textMuted} />
    </Pressable>
  );
});

// 세션 아이템 with photo observable
interface EnhancedSessionItemProps {
  session: PracticeLog;
  onPress: () => void;
  formatDuration: (minutes: number) => string;
}

const EnhancedSessionItemContent = ({
  session,
  photos,
  onPress,
  formatDuration,
}: EnhancedSessionItemProps & { photos: PracticeLogPhoto[] }) => {
  const firstImage = photos.length > 0 ? photos[0].photoPath : null;
  return (
    <SessionListItem
      session={session}
      firstImage={firstImage}
      onPress={onPress}
      formatDuration={formatDuration}
    />
  );
};

const enhanceSessionItem = withObservables(
  ['session'],
  ({ session }: { session: PracticeLog }) => ({
    session: session.observe(),
    photos: session.photosOrdered.observe(),
  })
);

const EnhancedSessionItem = enhanceSessionItem(EnhancedSessionItemContent);

// 메인 히스토리 컴포넌트
interface HistoryScreenContentProps {
  practiceLogs: PracticeLog[];
}

const HistoryScreenContent = memo(({ practiceLogs }: HistoryScreenContentProps) => {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};

    practiceLogs.forEach((session) => {
      const dateKey = session.date.split("T")[0];
      marks[dateKey] = {
        marked: true,
        dotColor: Colors.primary,
        customStyles: {
          container: {
            backgroundColor: Colors.secondary,
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
  }, [practiceLogs, selectedDate]);

  const sessionsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return practiceLogs.filter(
      (session) => session.date.split("T")[0] === selectedDate
    );
  }, [practiceLogs, selectedDate]);

  const handleDayPress = useCallback((day: DateData) => {
    setSelectedDate(day.dateString);
  }, []);

  const formatDuration = useCallback((minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  }, []);

  const totalSessions = practiceLogs.length;
  const totalMinutes = practiceLogs.reduce((acc, s) => acc + s.duration, 0);
  const totalHours = Math.floor(totalMinutes / 60);

  const handleSessionPress = useCallback((sessionId: string) => {
    router.push(`/session/${sessionId}`);
  }, [router]);

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: Colors.background }}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <CalendarIcon size={28} color={Colors.primary} />
          <Text style={styles.headerTitle}>History</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          {totalSessions} sessions • {totalHours}h {totalMinutes % 60}m total
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <RNCalendar
            onDayPress={handleDayPress}
            markedDates={markedDates}
            markingType="custom"
            theme={{
              calendarBackground: Colors.background,
              textSectionTitleColor: Colors.textMuted,
              selectedDayBackgroundColor: Colors.primary,
              selectedDayTextColor: Colors.background,
              todayTextColor: Colors.primary,
              dayTextColor: Colors.text,
              textDisabledColor: Colors.textMuted + "60",
              monthTextColor: Colors.text,
              arrowColor: Colors.primary,
              textDayFontWeight: "500",
              textMonthFontWeight: "bold",
              textDayHeaderFontWeight: "600",
            }}
            style={styles.calendar}
          />
        </View>

        {/* Sessions for selected date */}
        {selectedDate && (
          <View style={styles.sessionsContainer}>
            <Text style={styles.sectionTitle}>
              {sessionsForSelectedDate.length > 0
                ? `${sessionsForSelectedDate.length} Session${
                    sessionsForSelectedDate.length > 1 ? "s" : ""
                  }`
                : "No sessions"}
            </Text>

            {sessionsForSelectedDate.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No yoga sessions on this day</Text>
              </View>
            ) : (
              <View style={styles.sessionsList}>
                {sessionsForSelectedDate.map((session) => (
                  <EnhancedSessionItem
                    key={session.id}
                    session={session}
                    onPress={() => handleSessionPress(session.id)}
                    formatDuration={formatDuration}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Recent sessions */}
        {!selectedDate && practiceLogs.length > 0 && (
          <View style={styles.sessionsContainer}>
            <Text style={styles.sectionTitle}>Recent Sessions</Text>
            <View style={styles.sessionsList}>
              {practiceLogs.slice(0, 5).map((session) => (
                <EnhancedSessionItem
                  key={session.id}
                  session={session}
                  onPress={() => handleSessionPress(session.id)}
                  formatDuration={formatDuration}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
});

// withObservables로 practice_logs 컬렉션 observe
const enhanceHistoryScreen = withObservables([], () => ({
  practiceLogs: practiceLogsCollection
    .query(Q.sortBy('date', Q.desc))
    .observe(),
}));

const HistoryScreen = enhanceHistoryScreen(HistoryScreenContent);

export default HistoryScreen;

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 29,
    paddingTop: 19,
    paddingBottom: 10,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.textMuted,
    letterSpacing: -0.5,
  },
  calendarContainer: {
    paddingHorizontal: 19,
    marginTop: 19,
  },
  calendar: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sessionsContainer: {
    paddingHorizontal: 19,
    marginTop: 29,
    marginBottom: 29,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 14,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  emptyCard: {
    padding: 29,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    color: Colors.textMuted,
    letterSpacing: -0.5,
  },
  sessionsList: {
    gap: 14,
  },
  sessionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  thumbnailPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.secondary,
  },
  sessionInfo: {
    flex: 1,
    marginLeft: 14,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  sessionMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 5,
  },
  metaText: {
    fontSize: 14,
    color: Colors.textMuted,
    letterSpacing: -0.5,
  },
  intensityStars: {
    fontSize: 14,
    color: Colors.primary,
  },
});
