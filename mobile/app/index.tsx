import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BrandMark } from '../components/BrandUI';
import { useSession } from '../lib/session';
import { useThemeColors } from '../lib/theme';

export default function LaunchScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const hydrate = useSession(s => s.hydrate);
  const user = useSession(s => s.user);
  const loading = useSession(s => s.loading);
  useEffect(() => { void hydrate(); }, [hydrate]);
  useEffect(() => {
    if (!loading) router.replace(user ? '/(tabs)/nearby' : '/onboarding');
  }, [loading, user, router]);
  return <View style={{ flex: 1, backgroundColor: c.void, justifyContent: 'center', alignItems: 'center', gap: 18 }}>
    <BrandMark size={93} />
    <Text style={{ color: c.text, fontFamily: 'Ubuntu_700Bold', fontSize: 28 }}>Bsquare</Text>
    <Text style={{ color: c.textDim, fontFamily: 'Ubuntu_400Regular', fontSize: 13 }}>The right people. For you.</Text>
    <ActivityIndicator color={c.accent} style={{ marginTop: 18 }} />
  </View>;
}
