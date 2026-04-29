import React from 'react';
import { Tabs } from 'expo-router';
import { Icon } from 'native-base';
import { LucideMic, LucideHistory, LucideBarChart3 } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#091328',
          borderTopWidth: 0,
          elevation: 0,
          height: 60,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: '#88adff',
        tabBarInactiveTintColor: '#4e5c71',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'INTERVIEW',
          tabBarIcon: ({ color }) => <Icon as={LucideMic} size="sm" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'HISTORY',
          tabBarIcon: ({ color }) => <Icon as={LucideHistory} size="sm" color={color} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'INSIGHTS',
          tabBarIcon: ({ color }) => <Icon as={LucideBarChart3} size="sm" color={color} />,
        }}
      />
    </Tabs>
  );
}
