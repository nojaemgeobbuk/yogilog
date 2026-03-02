import React from "react";
import { View, StyleSheet, Pressable, Platform, Text } from "react-native";
import { Tabs } from "expo-router";
import { Home, Library, Calendar, Trophy } from "lucide-react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";

// Custom Floating Tab Bar Component
function FloatingTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: insets.bottom + 12 }]}>
      <BlurView
        intensity={20}
        tint="light"
        style={styles.blurContainer}
      >
        <View style={styles.tabBar}>
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const label = options.tabBarLabel ?? options.title ?? route.name;
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: "tabLongPress",
                target: route.key,
              });
            };

            // Icon component
            const IconComponent = options.tabBarIcon;

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tabButton}
              >
                <AnimatedTabIcon
                  isFocused={isFocused}
                  IconComponent={IconComponent}
                  label={label}
                />
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

// Animated Tab Icon Component
function AnimatedTabIcon({ isFocused, IconComponent, label }: any) {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withSpring(isFocused ? 1.1 : 1, {
      damping: 15,
      stiffness: 150,
    });
  }, [isFocused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const color = isFocused ? "#000000" : "#666666"; // 활성: 검정, 비활성: 회색

  return (
    <Animated.View style={[styles.tabIconContainer, animatedStyle]}>
      {IconComponent && <IconComponent color={color} size={24} />}
      <Text
        style={[
          styles.tabLabel,
          { color, fontWeight: isFocused ? "700" : "500" },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Animated.View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ color, size }) => <Library size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Achievements",
          tabBarIcon: ({ color, size }) => <Trophy size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20, // 양옆 여백
    paddingTop: 0,
  },
  blurContainer: {
    borderRadius: 30, // 캡슐 형태
    overflow: "hidden",
    backgroundColor: "#FFFFFF", // 완전 불투명 흰색
    borderWidth: 1, // 얇은 테두리
    borderColor: "rgba(0, 0, 0, 0.08)", // 아주 연한 회색 테두리
    // 그림자 효과 (강화)
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  tabBar: {
    flexDirection: "row",
    height: 65,
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 16,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  tabIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  tabLabel: {
    fontSize: 11,
    letterSpacing: -0.3,
    marginTop: 2,
  },
});
