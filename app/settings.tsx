import { useState, useCallback, memo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  Image,
  Linking,
  Alert,
  ActivityIndicator,
  Modal,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  Database,
  Download,
  Upload,
  Globe,
  Heart,
  HelpCircle,
  Info,
  FileText,
  ExternalLink,
  ChevronRight,
  Coffee,
  Sparkles,
} from "lucide-react-native";
import { Q } from "@nozbe/watermelondb";
import withObservables from "@nozbe/with-observables";
import { Colors } from "@/constants/Colors";
import { useSettingsStore, AsanaNameLanguage } from "@/store/useSettingsStore";
import { exportPracticeLogsToZip, shareZipFile } from "@/utils/exportBackup";
import { importPracticeLogsFromZip } from "@/utils/importBackup";
import { practiceLogsCollection, PracticeLog } from "@/database";

const APP_VERSION = "v1.0.0";
const KAKAOPAY_URL = "https://qr.kakaopay.com/Ej8RTlEOv9c407721";

// 오픈소스 라이선스 목록
const OPEN_SOURCE_LICENSES = [
  { name: "React Native", license: "MIT", url: "https://github.com/facebook/react-native" },
  { name: "Expo", license: "MIT", url: "https://github.com/expo/expo" },
  { name: "WatermelonDB", license: "MIT", url: "https://github.com/Nozbe/WatermelonDB" },
  { name: "Zustand", license: "MIT", url: "https://github.com/pmndrs/zustand" },
  { name: "Lucide Icons", license: "ISC", url: "https://github.com/lucide-icons/lucide" },
  { name: "date-fns", license: "MIT", url: "https://github.com/date-fns/date-fns" },
  { name: "React Native Calendars", license: "MIT", url: "https://github.com/wix/react-native-calendars" },
  { name: "React Native Reanimated", license: "MIT", url: "https://github.com/software-mansion/react-native-reanimated" },
  { name: "NativeWind", license: "MIT", url: "https://github.com/marklawlor/nativewind" },
  { name: "JSZip", license: "MIT/GPLv3", url: "https://github.com/Stuk/jszip" },
];

interface SettingsScreenContentProps {
  practiceLogs: PracticeLog[];
}

const SettingsScreenContent = memo(({ practiceLogs }: SettingsScreenContentProps) => {
  const router = useRouter();
  const asanaNameLanguage = useSettingsStore((state) => state.asanaNameLanguage);
  const setAsanaNameLanguage = useSettingsStore((state) => state.setAsanaNameLanguage);

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState({ title: "", subtitle: "" });
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showLicenseModal, setShowLicenseModal] = useState(false);

  // 내보내기 핸들러
  const handleExport = useCallback(() => {
    if (practiceLogs.length === 0) {
      Alert.alert(
        "내보낼 기록이 없어요",
        "먼저 수련 기록을 추가해 주세요.",
        [{ text: "확인" }]
      );
      return;
    }

    Alert.alert(
      "나의 수련 기록 내보내기",
      "지금까지 쌓인 소중한 기록들을 사진과 함께 묶어서 만들어 드릴게요!\n\n이 파일은 '노션(Notion)'이나 '옵시디언(Obsidian)' 같은 노트 앱에 옮겨서 나만의 수련 일지로 꾸밀 때 정말 유용해요.\n\n지금 생성할까요?",
      [
        { text: "다음에 할게요", style: "cancel" },
        {
          text: "좋아요, 내보낼래요!",
          onPress: async () => {
            setIsExporting(true);
            setLoadingMessage({ title: "백업 파일 생성 중...", subtitle: "잠시만 기다려 주세요" });
            try {
              const zipPath = await exportPracticeLogsToZip();
              await shareZipFile(zipPath);
              Alert.alert(
                "내보내기 완료",
                "기록을 안전하게 뽑아냈어요!",
                [{ text: "확인" }]
              );
            } catch (error) {
              console.error("Export failed:", error);
              Alert.alert(
                "내보내기 실패",
                error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
                [{ text: "확인" }]
              );
            } finally {
              setIsExporting(false);
            }
          },
        },
      ]
    );
  }, [practiceLogs.length]);

  // 가져오기 핸들러
  const handleImport = useCallback(() => {
    Alert.alert(
      "수련 기록 가져오기",
      "기존 데이터와 합쳐지거나 중복될 수 있어요. 계속할까요?\n\n(같은 날짜와 제목의 기록은 자동으로 건너뜁니다)",
      [
        { text: "취소", style: "cancel" },
        {
          text: "가져올게요",
          onPress: async () => {
            setIsImporting(true);
            setLoadingMessage({ title: "기록 가져오는 중...", subtitle: "잠시만 기다려 주세요" });
            try {
              const result = await importPracticeLogsFromZip((progress) => {
                switch (progress.stage) {
                  case "reading":
                    setLoadingMessage({ title: "ZIP 파일 읽는 중...", subtitle: "잠시만 기다려 주세요" });
                    break;
                  case "parsing":
                    setLoadingMessage({ title: "기록 분석 중...", subtitle: `${progress.current}/${progress.total}` });
                    break;
                  case "importing":
                    setLoadingMessage({ title: "데이터 저장 중...", subtitle: `${progress.current}/${progress.total}` });
                    break;
                  case "copying_photos":
                    setLoadingMessage({ title: "사진 복사 중...", subtitle: `${progress.current}/${progress.total}` });
                    break;
                }
              });

              let message = `${result.imported}개의 수련 기록을 성공적으로 불러왔습니다!`;
              if (result.skipped > 0) {
                message += `\n(중복 ${result.skipped}개 건너뜀)`;
              }
              if (result.errors.length > 0) {
                message += `\n(오류 ${result.errors.length}개)`;
              }

              Alert.alert("가져오기 완료", message, [{ text: "확인" }]);
            } catch (error) {
              if (error instanceof Error && error.message === "파일 선택이 취소되었습니다.") {
                // 사용자가 취소한 경우
              } else {
                console.error("Import failed:", error);
                Alert.alert(
                  "가져오기 실패",
                  error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
                  [{ text: "확인" }]
                );
              }
            } finally {
              setIsImporting(false);
            }
          },
        },
      ]
    );
  }, []);

  // 후원 링크 열기
  const handleDonation = useCallback(async () => {
    try {
      await Linking.openURL(KAKAOPAY_URL);
    } catch (error) {
      Alert.alert("링크를 열 수 없습니다", "브라우저를 통해 직접 접속해 주세요.");
    }
  }, []);

  // 리뷰 남기기 (Placeholder)
  const handleReview = useCallback(() => {
    Alert.alert(
      "리뷰 남기기",
      "앱스토어 리뷰 기능은 곧 추가될 예정이에요!\n따뜻한 응원의 한마디를 기다리고 있을게요.",
      [{ text: "확인" }]
    );
  }, []);

  // 언어 토글
  const handleLanguageToggle = useCallback((value: boolean) => {
    setAsanaNameLanguage(value ? "korean" : "sanskrit");
  }, [setAsanaNameLanguage]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* 데이터 관리 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Database size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>내 데이터 관리하기</Text>
          </View>

          <View style={styles.menuGroup}>
            <Pressable
              onPress={handleExport}
              disabled={isExporting || isImporting}
              style={styles.menuItem}
            >
              <Upload size={20} color={Colors.text} />
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>수련 기록 내보내기</Text>
                <Text style={styles.menuDescription}>사진과 함께 ZIP 파일로 백업해요</Text>
              </View>
              <ChevronRight size={18} color={Colors.textMuted} />
            </Pressable>

            <View style={styles.menuDivider} />

            <Pressable
              onPress={handleImport}
              disabled={isExporting || isImporting}
              style={styles.menuItem}
            >
              <Download size={20} color={Colors.text} />
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>수련 기록 가져오기</Text>
                <Text style={styles.menuDescription}>이전에 내보낸 기록을 불러와요</Text>
              </View>
              <ChevronRight size={18} color={Colors.textMuted} />
            </Pressable>
          </View>
        </View>

        {/* 표시 설정 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Globe size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>용어 표기 설정</Text>
          </View>

          <View style={styles.menuGroup}>
            <View style={styles.menuItem}>
              <Text style={styles.languageIcon}>
                {asanaNameLanguage === "korean" ? "가" : "अ"}
              </Text>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>
                  {asanaNameLanguage === "korean"
                    ? "한국어로 보기"
                    : "산스크리트어/영어로 보기"}
                </Text>
                <Text style={styles.menuDescription}>
                  {asanaNameLanguage === "korean"
                    ? "예: 아래를 향한 개 자세"
                    : "예: Adho Mukha Svanasana"}
                </Text>
              </View>
              <Switch
                value={asanaNameLanguage === "korean"}
                onValueChange={handleLanguageToggle}
                trackColor={{ false: "#9CA3AF", true: Colors.primary }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#9CA3AF"
              />
            </View>
          </View>
        </View>

        {/* 후원 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Coffee size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>동행 요기니에게 커피 한 잔 선물해주기</Text>
          </View>

          <Pressable onPress={handleDonation} style={styles.donationCard}>
            <View style={styles.donationIconRow}>
              <Sparkles size={20} color={Colors.primary} />
              <Coffee size={28} color={Colors.primary} />
              <Sparkles size={20} color={Colors.primary} />
            </View>
            <Text style={styles.donationTitle}>
              함께 더 나은 수련 경험을 만들어가요
            </Text>
            <Text style={styles.donationSubtext}>
              여러분의 작은 응원이 큰 힘이 됩니다
            </Text>
            <View style={styles.donationButtonWrapper}>
              <Image
                source={require("@/assets/images/btn_send_tiny.png")}
                style={styles.donationImage}
                resizeMode="contain"
              />
            </View>
          </Pressable>
        </View>

        {/* 기타 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Info size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>정보</Text>
          </View>

          <View style={styles.menuGroup}>
            <Pressable onPress={() => setShowHelpModal(true)} style={styles.menuItem}>
              <HelpCircle size={20} color={Colors.text} />
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>기능 사용 도움말</Text>
              </View>
              <ChevronRight size={18} color={Colors.textMuted} />
            </Pressable>

            <View style={styles.menuDivider} />

            <Pressable onPress={handleReview} style={styles.menuItem}>
              <ExternalLink size={20} color={Colors.text} />
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>리뷰 남기기</Text>
              </View>
              <ChevronRight size={18} color={Colors.textMuted} />
            </Pressable>

            <View style={styles.menuDivider} />

            <Pressable onPress={() => setShowLicenseModal(true)} style={styles.menuItem}>
              <FileText size={20} color={Colors.text} />
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>오픈소스 라이선스</Text>
              </View>
              <ChevronRight size={18} color={Colors.textMuted} />
            </Pressable>

            <View style={styles.menuDivider} />

            <View style={styles.menuItem}>
              <Info size={20} color={Colors.text} />
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>앱 버전</Text>
              </View>
              <Text style={styles.versionText}>{APP_VERSION}</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Loading Overlay */}
      {(isExporting || isImporting) && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>{loadingMessage.title}</Text>
            <Text style={styles.loadingSubtext}>{loadingMessage.subtitle}</Text>
          </View>
        </View>
      )}

      {/* Help Modal */}
      <Modal
        visible={showHelpModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowHelpModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowHelpModal(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>기능 사용 도움말</Text>

            <View style={styles.helpSection}>
              <Text style={styles.helpTitle}>수련 기록하기</Text>
              <Text style={styles.helpText}>
                홈 화면 오른쪽 하단의 + 버튼을 눌러 새로운 수련을 기록할 수 있어요.
                아사나, 시간, 강도, 사진 등을 추가해보세요.
              </Text>
            </View>

            <View style={styles.helpSection}>
              <Text style={styles.helpTitle}>아사나 라이브러리</Text>
              <Text style={styles.helpText}>
                라이브러리 탭에서 다양한 아사나를 살펴보고,
                각 아사나의 수련 횟수와 성장 레벨을 확인할 수 있어요.
              </Text>
            </View>

            <View style={styles.helpSection}>
              <Text style={styles.helpTitle}>배지 시스템</Text>
              <Text style={styles.helpText}>
                꾸준한 수련을 통해 다양한 배지를 획득해보세요!
                스트릭 유지, 특정 아사나 마스터 등 다양한 도전이 기다리고 있어요.
              </Text>
            </View>

            <Pressable onPress={() => setShowHelpModal(false)} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>확인</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* License Modal */}
      <Modal
        visible={showLicenseModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLicenseModal(false)}
      >
        <SafeAreaView style={styles.licenseModal} edges={['top', 'bottom']}>
          <View style={styles.licenseContainer}>
            <View style={styles.licenseHeader}>
              <Text style={styles.licenseTitle}>오픈소스 라이선스</Text>
              <Pressable onPress={() => setShowLicenseModal(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>닫기</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.licenseList} showsVerticalScrollIndicator={false}>
              <Text style={styles.licenseIntro}>
                이 앱은 다음의 오픈소스 라이브러리를 사용합니다.
              </Text>
              {OPEN_SOURCE_LICENSES.map((lib, index) => (
                <Pressable
                  key={index}
                  style={styles.licenseItem}
                  onPress={() => Linking.openURL(lib.url)}
                >
                  <View style={styles.licenseInfo}>
                    <Text style={styles.licenseName}>{lib.name}</Text>
                    <Text style={styles.licenseType}>{lib.license} License</Text>
                  </View>
                  <ExternalLink size={16} color={Colors.textMuted} />
                </Pressable>
              ))}
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
});

// withObservables로 practice_logs observe
const enhanceSettingsScreen = withObservables([], () => ({
  practiceLogs: practiceLogsCollection
    .query(Q.sortBy("date", Q.desc))
    .observe(),
}));

const SettingsScreen = enhanceSettingsScreen(SettingsScreenContent);

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  headerPlaceholder: {
    width: 40,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    letterSpacing: -0.3,
  },
  menuGroup: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
    letterSpacing: -0.3,
  },
  menuDescription: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
    letterSpacing: -0.2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginLeft: 48,
  },
  languageIcon: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    width: 20,
    textAlign: "center",
  },
  versionText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: "500",
  },
  // Donation
  donationCard: {
    backgroundColor: Colors.secondary,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  donationIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  donationTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text,
    textAlign: "center",
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  donationSubtext: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: "center",
    letterSpacing: -0.2,
    marginBottom: 20,
  },
  donationButtonWrapper: {
    borderRadius: 8,
    overflow: "hidden",
  },
  donationImage: {
    width: 140,
    height: 36,
  },
  // Loading
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingCard: {
    backgroundColor: Colors.background,
    padding: 32,
    borderRadius: 20,
    alignItems: "center",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  loadingSubtext: {
    fontSize: 14,
    color: Colors.textMuted,
    letterSpacing: -0.3,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    maxHeight: "80%",
    backgroundColor: Colors.background,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  helpSection: {
    marginBottom: 16,
  },
  helpTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.primary,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  helpText: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  modalButton: {
    marginTop: 8,
    paddingVertical: 14,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.background,
  },
  // License Modal
  licenseModal: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  licenseContainer: {
    flex: 1,
  },
  licenseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  licenseTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  closeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  licenseList: {
    flex: 1,
    padding: 20,
  },
  licenseIntro: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 16,
    lineHeight: 20,
  },
  licenseItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  licenseInfo: {
    flex: 1,
  },
  licenseName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
    letterSpacing: -0.3,
  },
  licenseType: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
