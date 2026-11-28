import type { ReactNode } from 'react';
import { Image, Text, View } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { useThemeColors } from '../lib/theme';

const brandMarkImage = require('../assets/brand-mark.png');
// brand-mark.png has transparent padding around the glyph; scale it so the "B" itself fills `size`.
const BRAND_MARK_GLYPH_RATIO = 0.57;

export function BrandMark({ size = 34 }: { size?: number }) {
  const imageSize = size / BRAND_MARK_GLYPH_RATIO;
  return <View accessible accessibilityRole="image" accessibilityLabel="B Square" style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <Image source={brandMarkImage} style={{ width: imageSize, height: imageSize }} resizeMode="contain" />
  </View>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  const c = useThemeColors();
  return <Text style={{ color: c.accent, fontFamily: 'Ubuntu_700Bold', fontSize: 10, letterSpacing: 1.8, textTransform: 'uppercase' }}>{children}</Text>;
}

export function Avatar({ name, size = 64, photo }: { name: string; size?: number; photo?: string | null }) {
  const c = useThemeColors();
  const initials = (name || 'B Square').trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase() || '').join('');
  const picture = typeof photo === 'string' && /^https:\/\//i.test(photo) ? photo : null;
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#4D79CF', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
    {picture ? <Image source={{ uri: picture }} style={{ width: size, height: size }} resizeMode="cover" /> : <Text style={{ color: c.text, fontFamily: 'Ubuntu_700Bold', fontSize: size * 0.31 }}>{initials}</Text>}
  </View>;
}

export function VerifiedPill({ label = 'Verified member' }: { label?: string }) {
  const c = useThemeColors();
  return <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: c.accent, borderRadius: 50, paddingHorizontal: 12, paddingVertical: 7 }}>
    <ShieldCheck size={13} strokeWidth={2.2} color={c.onAccent} />
    <Text style={{ color: c.onAccent, fontFamily: 'Ubuntu_700Bold', fontSize: 11 }}>{label}</Text>
  </View>;
}
