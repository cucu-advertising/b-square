import { Tabs } from 'expo-router';
import {
  Inbox,
  MapPin,
  MessageCircle,
  Palette,
  User,
} from 'lucide-react-native';
import { View, StyleSheet } from 'react-native';
import { useThemeColors } from '../../lib/theme';
import { useRequestsStore } from '../../lib/store';

export default function TabsLayout() {
  const colors = useThemeColors();
  const pendingCount = useRequestsStore((s) => s.requests.length);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.glassBorder,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 11,
        },
        animation: 'none',
      }}
    >
      <Tabs.Screen
        name="nearby"
        options={{
          title: 'Nearby',
          tabBarIcon: ({ color, size }) => <MapPin color={color} size={size} strokeWidth={1.75} />,
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Requests',
          tabBarIcon: ({ color, size }) => (
            <View>
              <Inbox color={color} size={size} strokeWidth={1.75} />
              {pendingCount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.coral }]} />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color, size }) => (
            <MessageCircle color={color} size={size} strokeWidth={1.75} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} strokeWidth={1.75} />,
        }}
      />
      {/* TODO: Remove or move Palette tab to a hidden dev menu before production release */}
      <Tabs.Screen
        name="palette"
        options={{
          title: 'Palette',
          tabBarIcon: ({ color, size }) => <Palette color={color} size={size} strokeWidth={1.75} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
