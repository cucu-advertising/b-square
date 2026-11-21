import { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { House, UsersRound, CalendarDays, MessageCircle, UserRound } from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';
import { useThemeColors } from '../../lib/theme';
import { haptic } from '../../lib/haptics';
import { useSession } from '../../lib/session';

export default function TabsLayout() {
  const router = useRouter();
  const c = useThemeColors();
  const { user, loading, hydrate } = useSession();
  useEffect(() => { if (!user && loading) void hydrate(); }, [user, loading, hydrate]);
  useEffect(() => { if (!loading && !user) router.replace('/login'); }, [loading, user, router]);
  if (!user) return <View style={{ flex: 1, backgroundColor: c.void, justifyContent: 'center' }}><ActivityIndicator color={c.accent} /></View>;
  return <Tabs
    screenListeners={{ tabPress: () => haptic('selection') }}
    screenOptions={{
      headerShown: false,
      tabBarStyle: { height: 76, backgroundColor: c.voidAlt, borderTopWidth: 1, borderTopColor: c.glassBorder, paddingTop: 9, paddingBottom: 13 },
      tabBarActiveTintColor: c.accent,
      tabBarInactiveTintColor: c.accent,
      tabBarLabelStyle: { fontFamily: 'Ubuntu_500Medium', fontSize: 10 },
      tabBarIconStyle: { opacity: 1 },
    }}>
    <Tabs.Screen name="nearby" options={{ title: 'Discover', tabBarIcon: ({ size }) => <House size={size} color={c.accent} /> }} />
    <Tabs.Screen name="requests" options={{ title: 'Network', tabBarIcon: ({ size }) => <UsersRound size={size} color={c.accent} /> }} />
    <Tabs.Screen name="events" options={{ title: 'Events', tabBarIcon: ({ size }) => <CalendarDays size={size} color={c.accent} /> }} />
    <Tabs.Screen name="chats" options={{ title: 'Inbox', tabBarIcon: ({ size }) => <MessageCircle size={size} color={c.accent} /> }} />
    <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ size }) => <UserRound size={size} color={c.accent} /> }} />
    <Tabs.Screen name="palette" options={{ href: null }} />
  </Tabs>;
}
