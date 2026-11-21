import { useState } from 'react';
import { Linking, Platform, Text, View } from 'react-native';
import { Linkedin } from 'lucide-react-native';
import { ScalePressable } from './AnimatedUI';
import { api, isConfigured } from '../lib/api';
import { useThemeColors } from '../lib/theme';

export function LinkedInButton({ label = 'Continue with LinkedIn' }: { label?: string }) {
  const c = useThemeColors();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const start = async () => {
    if (busy) return;
    setBusy(true); setError('');
    try {
      const { url } = await api.startLinkedIn(Platform.OS === 'web' ? 'web' : 'app');
      await Linking.openURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'LinkedIn verification is currently unavailable.');
      setBusy(false);
    }
  };
  return <View>
    <ScalePressable onPress={start} accessibilityRole="button" accessibilityLabel={label} disabled={busy || !isConfigured()}
      style={{ borderWidth: 1, borderColor: c.accent, borderRadius: 13, backgroundColor: c.voidAlt, padding: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, opacity: busy ? 0.5 : 1 }}>
      <Linkedin size={19} color={c.accent} />
      <Text style={{ color: c.accent, fontFamily: 'Ubuntu_700Bold', fontSize: 15 }}>{busy ? 'Opening LinkedIn…' : label}</Text>
    </ScalePressable>
    {error ? <Text style={{ color: '#FFB6B6', fontFamily: 'Ubuntu_400Regular', marginTop: 10 }}>{error}</Text> : null}
  </View>;
}
