import { useEffect } from 'react';
import { ActivityIndicator, Image, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSession } from '../lib/session';
export default function LaunchScreen() {
  const router = useRouter();
  const hydrate = useSession(s => s.hydrate);
  const user = useSession(s => s.user);
  const loading = useSession(s => s.loading);
  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => { if (!loading) router.replace(user ? '/(tabs)/nearby' : '/login'); }, [loading, user, router]);
  return <View style={{ flex: 1, backgroundColor: '#F8FAFE', alignItems: 'center', justifyContent: 'center', gap: 24 }}><Image source={require('../assets/brand-logo.png')} resizeMode="contain" accessibilityLabel="B Square" style={{ width: 220, height: 220 }} /><Text style={{ fontFamily: 'Ubuntu_400Regular', color: '#62728C', fontSize: 15 }}>Your next connection starts here.</Text><ActivityIndicator color="#234FC8" /></View>;
}
