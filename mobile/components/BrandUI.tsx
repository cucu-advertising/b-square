import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { useThemeColors } from '../lib/theme';

export function BrandMark({ size = 34 }: { size?: number }) {
  const c = useThemeColors();
  return <View accessibilityLabel="B Square" style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: c.accent, borderTopRightRadius: size * 0.48, borderBottomLeftRadius: size * 0.42, borderBottomRightRadius: size * 0.43 }}>
    <Text style={{ color: c.accent, fontFamily: 'Ubuntu_700Bold', fontSize: size * 0.68, lineHeight: size * 0.83 }}>B</Text>
  </View>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  const c = useThemeColors();
  return <Text style={{ color: c.accent, fontFamily: 'Ubuntu_700Bold', fontSize: 10, letterSpacing: 1.8, textTransform: 'uppercase' }}>{children}</Text>;
}

export function Avatar({ name, size = 64 }: { name: string; size?: number }) {
  const c = useThemeColors();
  const initials = (name || 'B Square').trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase() || '').join('');
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#4D79CF', alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ color: c.text, fontFamily: 'Ubuntu_700Bold', fontSize: size * 0.31 }}>{initials}</Text>
  </View>;
}

export function VerifiedPill({ label = 'Verified member' }: { label?: string }) {
  const c = useThemeColors();
  return <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: c.accent, borderRadius: 50, paddingHorizontal: 12, paddingVertical: 7 }}>
    <ShieldCheck size={13} strokeWidth={2.2} color={c.onAccent} />
    <Text style={{ color: c.onAccent, fontFamily: 'Ubuntu_700Bold', fontSize: 11 }}>{label}</Text>
  </View>;
}
