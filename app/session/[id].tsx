import { useRef, useState, useEffect, useMemo, memo } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  Alert,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  Share2,
  Trash2,
  Calendar,
  Clock,
  Activity,
  Pencil,
  Star,
} from "lucide-react-native";
import { WebView } from "react-native-webview";
import Animated, {
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";
import withObservables from "@nozbe/with-observables";
import { switchMap, of } from "rxjs";
import { usePracticeLogs } from "@/hooks/usePracticeLogs";
import { practiceLogsCollection, PracticeLog, PracticeLogAsana, PracticeLogPhoto } from "@/database";
import { DurationBar } from "@/components/DurationBar";
import { ShareCard } from "@/components/ShareCard";
import { AsanaIcon } from "@/components/AsanaIcon";
import { shareViewAsImage } from "@/utils/share";
import { Colors } from "@/constants/Colors";
import { ASANA_STATUS_CONFIG, AsanaRecord } from "@/types";

// 세션 데이터 인터페이스
interface SessionData {
  id: string;
  title: string;
  date: string;
  duration: number;
  intensity: number;
  note: string;
  isFavorite: boolean;
  images: string[];
  asanas: AsanaRecord[];
  hashtags: string[];
}

// withObservables로 observe되는 컴포넌트의 Props
interface SessionDetailContentProps {
  practiceLog: PracticeLog | null;
  photos: PracticeLogPhoto[];
  asanas: PracticeLogAsana[];
  isFound: boolean;
}

// 세션 상세 내용 컴포넌트
const SessionDetailContent = ({
  practiceLog,
  photos,
  asanas,
  isFound,
}: SessionDetailContentProps) => {
  const router = useRouter();
  const { deletePracticeLog, toggleFavorite } = usePracticeLogs();

  const shareCardRef = useRef<View>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [noteWebViewHeight, setNoteWebViewHeight] = useState(150);

  // practiceLog가 삭제되었는지 체크
  useEffect(() => {
    if (!isFound) {
      Alert.alert('오류', '세션을 찾을 수 없습니다.', [
        { text: '확인', onPress: () => router.replace('/') }
      ]);
    }
  }, [isFound, router]);

  // 로딩 또는 Not Found 상태
  if (!practiceLog || !isFound) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: Colors.background }}
      >
        {!isFound ? (
          <Text style={{ color: Colors.text }}>Session not found</Text>
        ) : (
          <>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={{ color: Colors.textMuted, marginTop: 16 }}>Loading...</Text>
          </>
        )}
      </SafeAreaView>
    );
  }

  // PracticeLog 데이터를 SessionData로 변환
  const session: SessionData = {
    id: practiceLog.id,
    title: practiceLog.title,
    date: practiceLog.date,
    duration: practiceLog.duration,
    intensity: practiceLog.intensity,
    note: practiceLog.note || '',
    isFavorite: practiceLog.isFavorite,
    images: photos.map((p) => p.photoPath),
    asanas: asanas.map((a) => ({
      asanaId: a.id,
      name: a.asanaName,
      note: a.note || '',
      status: a.status,
    })),
    hashtags: [],
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins} minutes`;
  };

  const handleShare = async () => {
    setShowShareModal(true);
    setTimeout(async () => {
      try {
        await shareViewAsImage(shareCardRef);
      } catch (error) {
        Alert.alert("Error", "Failed to share. Please try again.");
      }
      setShowShareModal(false);
    }, 500);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Session",
      "Are you sure you want to delete this session?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deletePracticeLog(session.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    router.push({ pathname: "/edit/[id]", params: { id: session.id } });
  };

  const handleToggleFavorite = async () => {
    try {
      await toggleFavorite(session.id);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      Alert.alert('오류', '즐겨찾기 변경에 실패했습니다.');
    }
  };

  const renderStatusChip = (status?: string) => {
    if (!status || !(status in ASANA_STATUS_CONFIG)) return null;
    const config = ASANA_STATUS_CONFIG[status as keyof typeof ASANA_STATUS_CONFIG];
    return (
      <View style={[styles.statusChip, { backgroundColor: config.bgColor }]}>
        <Text style={[styles.statusChipText, { color: config.color }]}>
          {config.label}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: Colors.background }}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerButton}>
          <ChevronLeft size={28} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Now Playing</Text>
        <View style={styles.headerActions}>
          <Pressable onPress={handleToggleFavorite} style={styles.headerButton}>
            <Star
              size={24}
              color={session.isFavorite === true ? Colors.primary : Colors.textMuted}
              fill={session.isFavorite === true ? Colors.primary : "transparent"}
            />
          </Pressable>
          <Pressable onPress={handleEdit} style={styles.headerButton}>
            <Pencil size={24} color={Colors.text} />
          </Pressable>
          <Pressable onPress={handleDelete} style={styles.headerButton}>
            <Trash2 size={24} color={Colors.text} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 38 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Album Art */}
        <Animated.View
          style={styles.albumContainer}
          entering={FadeIn.duration(400).springify()}
        >
          <Animated.View
            style={styles.albumCard}
            entering={FadeInDown.delay(100).duration(500).springify()}
          >
            {session.images.length > 0 ? (
              <Image
                source={{ uri: session.images[0] }}
                className="w-full aspect-square"
                resizeMode="cover"
              />
            ) : (
              <View style={styles.albumPlaceholder}>
                <Text style={styles.albumPlaceholderEmoji}>🧘</Text>
              </View>
            )}
          </Animated.View>
        </Animated.View>

        {/* Title & Info */}
        <Animated.View
          style={styles.infoContainer}
          entering={FadeInDown.delay(200).duration(400).springify()}
        >
          <Text style={styles.sessionTitle}>{session.title}</Text>

          <View style={styles.dateRow}>
            <Calendar size={16} color={Colors.textMuted} />
            <Text style={styles.dateText}>{formatDate(session.date)}</Text>
          </View>

          {/* Duration Bar */}
          <Animated.View
            style={styles.durationContainer}
            entering={FadeInDown.delay(300).duration(400).springify()}
          >
            <DurationBar duration={session.duration} />
          </Animated.View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Clock size={24} color={Colors.primary} />
              <Text style={styles.statValue}>{formatDuration(session.duration)}</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
            <View style={styles.statItem}>
              <Activity size={24} color={Colors.primary} />
              <Text style={styles.statValue}>{session.intensity}/5</Text>
              <Text style={styles.statLabel}>Intensity</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>🧘</Text>
              <Text style={styles.statValue}>{session.asanas.length}</Text>
              <Text style={styles.statLabel}>Asanas</Text>
            </View>
          </View>

          {/* Hashtags */}
          {session.hashtags.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>TAGS</Text>
              <View style={styles.tagsRow}>
                {session.hashtags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Asanas */}
          {session.asanas.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>ASANAS</Text>
              <View style={styles.asanaList}>
                {session.asanas.map((asana: AsanaRecord, index: number) => (
                  <Animated.View
                    key={asana.asanaId}
                    entering={FadeInDown.delay(400 + index * 50).duration(300)}
                    style={styles.asanaCard}
                  >
                    {/* Header with beige background */}
                    <View style={styles.asanaHeader}>
                      <View style={styles.asanaNumberBadge}>
                        <Text style={styles.asanaNumber}>{index + 1}</Text>
                      </View>
                      <View style={styles.asanaIconContainer}>
                        <AsanaIcon name={asana.name} size={28} color={Colors.text} />
                      </View>
                      <View style={styles.asanaTitleContainer}>
                        <Text style={styles.asanaName} numberOfLines={1}>
                          {asana.name}
                        </Text>
                      </View>
                      {renderStatusChip(asana.status)}
                    </View>

                    {/* Note */}
                    {asana.note && asana.note.trim() !== "" && (
                      <View style={styles.asanaNoteContainer}>
                        <Text style={styles.asanaNote}>{asana.note}</Text>
                      </View>
                    )}
                  </Animated.View>
                ))}
              </View>
            </View>
          )}

          {/* Notes - HTML Rich Text */}
          {session.note && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>NOTES</Text>
              <View style={styles.noteCard}>
                <WebView
                  source={{
                    html: `
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
                          <style>
                            * {
                              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                              color: ${Colors.text};
                              box-sizing: border-box;
                            }
                            body {
                              background-color: ${Colors.background};
                              padding: 19px;
                              margin: 0;
                              font-size: 16px;
                              line-height: 1.6;
                              letter-spacing: -0.5px;
                            }
                            p { margin: 0 0 12px 0; }
                            h1, h2, h3 { color: ${Colors.text}; margin: 16px 0 8px 0; }
                            h1 { font-size: 24px; }
                            h2 { font-size: 20px; }
                            h3 { font-size: 18px; }
                            ul, ol { margin: 8px 0; padding-left: 24px; }
                            li { margin: 4px 0; line-height: 1.5; }
                            input[type="checkbox"] {
                              margin-right: 8px;
                              width: 18px;
                              height: 18px;
                              accent-color: ${Colors.primary};
                            }
                            blockquote {
                              border-left: 3px solid ${Colors.primary};
                              margin: 12px 0;
                              padding-left: 16px;
                              color: ${Colors.textMuted};
                              font-style: italic;
                            }
                            a { color: ${Colors.primary}; }
                            strong, b { font-weight: 600; }
                            em, i { font-style: italic; }
                            u { text-decoration: underline; }
                            s, strike { text-decoration: line-through; }
                          </style>
                        </head>
                        <body>${session.note}</body>
                      </html>
                    `,
                  }}
                  style={{
                    flex: 1,
                    height: noteWebViewHeight,
                    backgroundColor: Colors.background,
                  }}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                  originWhitelist={['*']}
                  onMessage={(event) => {
                    try {
                      const data = JSON.parse(event.nativeEvent.data);
                      if (data.height && data.height > 0) {
                        setNoteWebViewHeight(Math.max(100, data.height + 20));
                      }
                    } catch (e) {}
                  }}
                  injectedJavaScript={`
                    (function() {
                      setTimeout(() => {
                        const height = document.body.scrollHeight;
                        window.ReactNativeWebView.postMessage(JSON.stringify({height}));
                      }, 100);
                    })();
                    true;
                  `}
                />
              </View>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Share Button */}
      <View style={styles.shareButtonContainer}>
        <Pressable onPress={handleShare} style={styles.shareButton}>
          <Share2 size={24} color={Colors.background} />
          <Text style={styles.shareButtonText}>Share Card</Text>
        </Pressable>
      </View>

      {/* Share Modal */}
      <Modal visible={showShareModal} transparent>
        <View className="flex-1 items-center justify-center bg-black/80">
          <ShareCard ref={shareCardRef} session={session} />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// withObservables로 practiceLog와 관계 데이터 observe
const enhanceWithObservables = withObservables(
  ['id'],
  ({ id }: { id: string | undefined }) => {
    if (!id) {
      return {
        practiceLog: of(null),
        photos: of([]),
        asanas: of([]),
        isFound: of(false),
      };
    }

    // practiceLog를 observe하고, 관계 데이터도 함께 observe
    const practiceLog$ = practiceLogsCollection.findAndObserve(id).pipe(
      switchMap((log) => of(log))
    );

    return {
      practiceLog: practiceLog$,
      photos: practiceLog$.pipe(
        switchMap((log) => (log ? log.photosOrdered.observe() : of([])))
      ),
      asanas: practiceLog$.pipe(
        switchMap((log) => (log ? log.asanasOrdered.observe() : of([])))
      ),
      isFound: of(true),
    };
  }
);

const EnhancedSessionDetail = enhanceWithObservables(SessionDetailContent);

// 메인 export 컴포넌트 (라우트 파라미터 처리)
export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: Colors.background }}
      >
        <Text style={{ color: Colors.text }}>Invalid session ID</Text>
      </SafeAreaView>
    );
  }

  return <EnhancedSessionDetail id={id} />;
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 19,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  albumContainer: {
    paddingHorizontal: 29,
    marginTop: 19,
  },
  albumCard: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  albumPlaceholder: {
    width: "100%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.secondary,
  },
  albumPlaceholderEmoji: {
    fontSize: 120,
  },
  infoContainer: {
    paddingHorizontal: 29,
    marginTop: 29,
  },
  sessionTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 19,
  },
  dateText: {
    color: Colors.textMuted,
    letterSpacing: -0.5,
  },
  durationContainer: {
    marginBottom: 29,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 19,
    borderRadius: 16,
    marginBottom: 29,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  statItem: {
    alignItems: "center",
  },
  statEmoji: {
    fontSize: 24,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textMuted,
    letterSpacing: -0.5,
  },
  section: {
    marginBottom: 29,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 14,
    color: Colors.textMuted,
    letterSpacing: -0.5,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: {
    color: Colors.text,
    letterSpacing: -0.5,
  },
  asanaList: {
    gap: 14,
  },
  asanaCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  asanaHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 19,
    backgroundColor: Colors.secondary,
  },
  asanaNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  asanaNumber: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.background,
  },
  asanaIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  asanaTitleContainer: {
    flex: 1,
  },
  asanaName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: -0.5,
  },
  asanaNoteContainer: {
    padding: 19,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  asanaNote: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 20,
    letterSpacing: -0.5,
  },
  noteCard: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    minHeight: 100,
  },
  shareButtonContainer: {
    paddingHorizontal: 29,
    paddingBottom: 19,
    paddingTop: 10,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 9999,
    gap: 10,
    backgroundColor: Colors.primary,
  },
  shareButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.background,
    letterSpacing: -0.5,
  },
});
