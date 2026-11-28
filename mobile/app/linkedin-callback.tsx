import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api, storeSession } from '../lib/api';
import { useSession } from '../lib/session';
import { useThemeColors } from '../lib/theme';
import { PrimaryButton } from '../components/PrimaryButton';

export default function LinkedInCallback() {
  const c = useThemeColors();
  const { ticket, error: oauthError } = useLocalSearchParams<{ticket?: string; error?: string}>();
  const router = useRouter();
  const hydrate = useSession(s => s.hydrate);
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (oauthError) { setMessage(oauthError); return; }
    if (!ticket) { setMessage('LinkedIn verification did not return a valid session.'); return; }
    let active = true;
    const complete = async () => {
      try {
        const data = await api.completeLinkedIn(ticket);
        if (!active) return;
        if (data.status === 'approved' && data.accessToken && data.refreshToken) {
          await storeSession(data.accessToken, data.refreshToken);
          await hydrate();
          router.replace('/(tabs)/nearby');
        } else if (data.status === 'profile_required') {
          router.replace({ pathname: '/linkedin-apply', params: { ticket, name: data.name || '', email: data.email || '' } });
        } else setMessage(data.message || 'LinkedIn verification needs attention.');
      } catch (e) { if (active) setMessage(e instanceof Error ? e.message : 'LinkedIn verification failed'); }
    };
    void complete();
    return () => { active = false; };
  }, [ticket, oauthError, router, hydrate]);
  return <View style={{ flex: 1, justifyContent: 'center', padding: 26, gap: 20, backgroundColor: c.void }}>
    {message ? <>
      <Text style={{ color: c.text, fontFamily: 'Ubuntu_700Bold', fontSize: 30 }}>Verification needs attention.</Text>
      <Text style={{ color: c.textDim, fontFamily: 'Ubuntu_400Regular', fontSize: 16, lineHeight: 25 }}>{message}</Text>
      <PrimaryButton label="Use work email instead" onPress={() => router.replace('/register')} />
    </> : <View style={{ alignItems: 'center', gap: 18 }}>
      <ActivityIndicator color={c.accent} size="large" />
      <Text style={{ color: c.textDim, fontFamily: 'Ubuntu_400Regular' }}>Checking your LinkedIn identity…</Text>
    </View>}
  </View>;
}
