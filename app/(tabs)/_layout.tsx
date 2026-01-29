import React from "react";
import { View, StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { Home, Library, Calendar, Trophy } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";

// Custom gradient background for tab bar
function TabBarBackground() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[Colors.secondary, Colors.secondary + "80", Colors.background]}
        locations={[0, 0.3, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Top border line */}
      <View style={styles.topBorder} />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,        // Apricot for active
        tabBarInactiveTintColor: Colors.tabInactive,  // Muted gray for inactive
        tabBarBackground: () => <TabBarBackground />,
        tabBarStyle: {
          backgroundColor: "transparent",
          borderTopWidth: 0,  // We handle border in TabBarBackground
          paddingTop: 12,
          paddingBottom: 12,
          height: 75,
          elevation: 0,  // Remove shadow on Android
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          letterSpacing: -0.5,
        },
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
  topBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.border,
  },
});
