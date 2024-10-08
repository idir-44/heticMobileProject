import { Tabs } from "expo-router";
import React from "react";

import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              name={focused ? "home" : "home-outline"}
              color="#4b269b"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="traduction"
        options={{
          title: "Translate",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="language" color="#4b269b" />
          ),
        }}
      />
    </Tabs>
  );
}
