import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Tabs, type BottomTabBarProps } from 'expo-router/js-tabs';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, Inbox, MessageCircle, User, Palette } from 'lucide-react-native';
import { PressableScale } from '@/components/PressableScale';
import { useTheme } from '@/lib/theme';
import { Fonts } from '@/lib/typography';
import { useAppStore } from '@/lib/store';

const ICONS: Record<string, React.ComponentType<{ size: number; color: string; strokeWidth: number }>> = {
  nearby: MapPin,
  requests: Inbox,
  chats: MessageCircle,
  profile: User,
  palette: Palette,
};

const LABELS: Record<string, string> = {
  nearby: 'Nearby',
  requests: 'Requests',
  chats: 'Chats',
  profile: 'Profile',
  palette: 'Palette',
};

function GlassTabBar({ state, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const pending = useAppStore((s) => s.requests.length);
  const isLight = colors.void.toLowerCase() === '#f5f7fb';

  return (
    <View style={[styles.wrap, { paddingBottom: insets.bottom || 12 }]}>
      <BlurView intensity={40} tint={isLight ? 'light' : 'dark'} style={StyleSheet.absoluteFill} />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: colors.glass, borderTopColor: colors.glassBorder, borderTopWidth: StyleSheet.hairlineWidth },
        ]}
      />
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const Icon = ICONS[route.name] ?? MapPin;
          const showDot = route.name === 'requests' && pending > 0;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <PressableScale key={route.key} onPress={onPress} style={styles.tab} scaleTo={0.9}>
              <View>
                <Icon size={23} color={focused ? colors.accent : colors.textFaint} strokeWidth={focused ? 2.4 : 2} />
                {showDot && <View style={[styles.dot, { backgroundColor: colors.coral, borderColor: colors.void }]} />}
              </View>
              <Text
                style={[
                  styles.label,
                  { color: focused ? colors.accent : colors.textFaint },
                ]}
              >
                {LABELS[route.name]}
              </Text>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false, animation: 'none' }}
      tabBar={(props) => <GlassTabBar {...props} />}
    >
      <Tabs.Screen name="nearby" />
      <Tabs.Screen name="requests" />
      <Tabs.Screen name="chats" />
      <Tabs.Screen name="profile" />
      {/*
        Palette is the live theme switcher. Keep it in the shipped nav for THIS
        prototype so stakeholders can flip themes live. Before a real release
        this tab should be removed or moved to a hidden dev menu.
      */}
      <Tabs.Screen name="palette" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 10, overflow: 'hidden' },
  row: { flexDirection: 'row', paddingHorizontal: 8 },
  tab: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 2 },
  label: { fontFamily: Fonts.monoMedium, fontSize: 9.5, letterSpacing: 0.5, textTransform: 'uppercase' },
  dot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 1.5,
  },
});
