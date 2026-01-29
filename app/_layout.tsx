import "../global.css";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { useYogaStore } from "@/store/useYogaStore";
import { BadgeCelebrationModal } from "@/components/BadgeCelebrationModal";
import { Colors } from "@/constants/Colors";
import { DatabaseProvider } from "@/database/DatabaseProvider";
import { migrateFromAsyncStorage, checkMigrationNeeded } from "@/database/migration";

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

  useEffect(() => {
    if (error) throw error;
  }, [error]);

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

  useEffect(() => {
    if (loaded && migrationComplete) {
      SplashScreen.hideAsync();
    }
  }, [loaded, migrationComplete]);

  if (!loaded || !migrationComplete) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>
          {!migrationComplete ? '데이터 준비 중...' : '로딩 중...'}
        </Text>
      </View>
    );
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: Colors.textMuted,
  },
});

function RootLayoutNav() {
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
