import { useThemeColors } from '../lib/theme';
import { useEffect } from 'react';
import { ActivityIndicator, Image, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSession } from '../lib/session';
export default function LaunchScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const hydrate = useSession(s => s.hydrate);
  const user = useSession(s => s.user);
  const loading = useSession(s => s.loading);
  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => { if (!loading) router.replace(user ? '/(tabs)/nearby' : '/login'); }, [loading, user, router]);
  return <View style={{ flex: 1, backgroundColor: colors.void, alignItems: 'center', justifyContent: 'center', gap: 24 }}><Image source={require('../assets/brand-logo.png')} resizeMode="contain" accessibilityLabel="B Square" style={{ width: 220, height: 220 }} /><Text style={{ fontFamily: 'Ubuntu_400Regular', color: colors.textDim, fontSize: 15 }}>Your next connection starts here.</Text><ActivityIndicator color="#385A53" /></View>;
}
