import { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { CalendarDays, Inbox, MapPin, MessageCircle, User } from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';
import { haptic } from '../../lib/haptics';
import { useSession } from '../../lib/session';
export default function TabsLayout() {
  const router = useRouter();
  const { user, loading, hydrate } = useSession();
  useEffect(() => { if (!user && loading) hydrate(); }, [user, loading, hydrate]);
  useEffect(() => { if (!loading && !user) router.replace('/login'); }, [loading, user, router]);
  if (!user) return <View style={{ flex: 1, backgroundColor: '#F8FAFE', justifyContent: 'center' }}><ActivityIndicator color="#234FC8" /></View>;
  return <Tabs screenListeners={{ tabPress: () => haptic('selection') }} screenOptions={{ headerShown: false, tabBarStyle: { height: 74, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E3EBF5', paddingTop: 9, paddingBottom: 12 }, tabBarActiveTintColor: '#234FC8', tabBarInactiveTintColor: '#8090AB', tabBarLabelStyle: { fontFamily: 'Ubuntu_500Medium', fontSize: 11 } }}>
    <Tabs.Screen name="nearby" options={{ title: 'Discover', tabBarIcon: ({ color, size }) => <MapPin color={color} size={size} /> }} />
    <Tabs.Screen name="requests" options={{ title: 'Requests', tabBarIcon: ({ color, size }) => <Inbox color={color} size={size} /> }} />
    <Tabs.Screen name="events" options={{ title: 'Events', tabBarIcon: ({ color, size }) => <CalendarDays color={color} size={size} /> }} />
    <Tabs.Screen name="chats" options={{ title: 'Chats', tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} /> }} />
    <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }} />
    <Tabs.Screen name="palette" options={{ href: null }} />
  </Tabs>;
}
