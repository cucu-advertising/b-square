import { Tabs } from 'expo-router';
import { Inbox, MapPin, MessageCircle, Palette, User } from 'lucide-react-native';
import React from 'react';
import { ColorValue, StyleSheet, View } from 'react-native';
import { fonts } from '../../lib/fonts';
import { useAppStore } from '../../lib/store';
import { useTheme } from '../../lib/theme';

function TabIcon({
  Icon,
  color,
  showBadge,
}: {
  Icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  color: ColorValue;
  showBadge?: boolean;
}) {
  const theme = useTheme();
  return (
    <View>
      <Icon size={22} color={color as string} strokeWidth={2} />
      {showBadge && (
        <View style={[styles.badge, { backgroundColor: theme.colors.coral, borderColor: theme.colors.void }]} />
      )}
    </View>
  );
}

export default function TabsLayout() {
  const theme = useTheme();
  const pendingRequests = useAppStore((s) => s.requests.length);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textFaint,
        tabBarStyle: {
          backgroundColor: theme.colors.voidAlt,
          borderTopColor: theme.colors.glassBorder,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 86,
          paddingTop: 10,
          paddingBottom: 28,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.body600,
          fontSize: 11,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="nearby"
        options={{
          title: 'Nearby',
          tabBarIcon: ({ color }) => <TabIcon Icon={MapPin} color={color} />,
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Requests',
          tabBarIcon: ({ color }) => (
            <TabIcon Icon={Inbox} color={color} showBadge={pendingRequests > 0} />
          ),
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color }) => <TabIcon Icon={MessageCircle} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabIcon Icon={User} color={color} />,
        }}
      />
      {/*
        DEV-ONLY: the live theme switcher is kept as a visible tab so
        stakeholders can flip themes during demos. Before shipping, move
        this behind a hidden dev menu / gesture instead of the main nav.
      */}
      <Tabs.Screen
        name="palette"
        options={{
          title: 'Palette',
          tabBarIcon: ({ color }) => <TabIcon Icon={Palette} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -2,
    right: -6,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
  },
});
