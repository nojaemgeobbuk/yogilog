import "../global.css";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { useYogaStore } from "@/store/useYogaStore";
import { BadgeCelebrationModal } from "@/components/BadgeCelebrationModal";
import { useBadgeObserver } from "@/hooks/useBadgeObserver";
import { Colors } from "@/constants/Colors";
import { DatabaseProvider } from "@/database/DatabaseProvider";
import { migrateFromAsyncStorage, checkMigrationNeeded } from "@/database/migration";
import { LotusSplash } from "@/components/LotusSplash";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

// Warm Minimal Light Theme - forced light mode
const warmMinimalTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.background,  // #FFFFFF
    card: Colors.background,        // #FFFFFF
    primary: Colors.primary,        // #FFB07C (Apricot)
    text: Colors.text,              // #000000
    border: Colors.border,          // #000000
    notification: Colors.primary,   // #FFB07C
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });
  const [migrationComplete, setMigrationComplete] = useState(false);
  const [migrationError, setMigrationError] = useState<string | null>(null);
  const [splashAnimationComplete, setSplashAnimationComplete] = useState(false);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // 네이티브 스플래시 즉시 숨김 (커스텀 애니메이션 사용)
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  // 마이그레이션 실행
  useEffect(() => {
    async function runMigration() {
      try {
        const needsMigration = await checkMigrationNeeded();
        if (needsMigration) {
          console.log('[App] Running migration...');
          const result = await migrateFromAsyncStorage();
          if (!result.success) {
            setMigrationError(result.error || 'Migration failed');
          }
        }
        setMigrationComplete(true);
      } catch (e) {
        console.error('[App] Migration error:', e);
        setMigrationError(e instanceof Error ? e.message : 'Unknown error');
        setMigrationComplete(true); // 에러가 있어도 앱은 계속 실행
      }
    }
    runMigration();
  }, []);

  // 스플래시 애니메이션 완료 핸들러
  const handleSplashComplete = () => {
    setSplashAnimationComplete(true);
  };

  // 앱 로딩이 완료되지 않았거나 스플래시 애니메이션이 진행 중일 때
  const isReady = loaded && migrationComplete;
  const showSplash = !splashAnimationComplete;

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <LotusSplash
          onAnimationComplete={handleSplashComplete}
        />
      </View>
    );
  }

  // 앱이 아직 준비되지 않았으면 빈 화면 (스플래시 이후)
  if (!isReady) {
    return <View style={styles.loadingContainer} />;
  }

  if (migrationError) {
    console.warn('[App] Migration error occurred:', migrationError);
    // 에러가 있어도 앱은 계속 실행 (기존 데이터 사용)
  }

  return (
    <DatabaseProvider>
      <RootLayoutNav />
    </DatabaseProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});

function RootLayoutNav() {
  // WatermelonDB Observable을 통해 practice_logs 변경 감지 및 배지 자동 체크
  useBadgeObserver();

  const newlyUnlockedBadgeIds = useYogaStore(
    (state) => state.newlyUnlockedBadgeIds
  );
  const clearNewlyUnlockedBadges = useYogaStore(
    (state) => state.clearNewlyUnlockedBadges
  );
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationBadgeIds, setCelebrationBadgeIds] = useState<string[]>([]);

  useEffect(() => {
    if (newlyUnlockedBadgeIds.length > 0) {
      setCelebrationBadgeIds([...newlyUnlockedBadgeIds]);
      setShowCelebration(true);
    }
  }, [newlyUnlockedBadgeIds]);

  const handleCloseCelebration = () => {
    setShowCelebration(false);
    setCelebrationBadgeIds([]);
    clearNewlyUnlockedBadges();
  };

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.background }}>
      <ThemeProvider value={warmMinimalTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="(modals)/write"
            options={{
              presentation: "modal",
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen
            name="session/[id]"
            options={{
              animation: "fade_from_bottom",
              animationDuration: 300,
              gestureEnabled: true,
              gestureDirection: "vertical",
            }}
          />
          <Stack.Screen name="library/[asanaName]" />
          <Stack.Screen name="edit/[id]" />
          <Stack.Screen
            name="settings"
            options={{
              animation: "slide_from_right",
            }}
          />
        </Stack>

        <BadgeCelebrationModal
          visible={showCelebration}
          badgeIds={celebrationBadgeIds}
          onClose={handleCloseCelebration}
        />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
