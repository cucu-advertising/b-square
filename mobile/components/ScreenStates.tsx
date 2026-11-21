import { ActivityIndicator, Text, View } from 'react-native';
import { useThemeColors } from '../lib/theme';
import { Eyebrow } from './BrandUI';
import { ScalePressable } from './AnimatedUI';

export function LoadingState() {
  const c = useThemeColors();
  return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 26 }}>
    <ActivityIndicator size="large" color={c.accent} />
    <Text style={{ color: c.textDim, fontFamily: 'Ubuntu_400Regular', marginTop: 19 }}>Finding your circle...</Text>
  </View>;
}
export function MessageState({ message, retry }: { message: string; retry?: () => void }) {
  const c = useThemeColors();
  return <View style={{ flex: 1, paddingHorizontal: 32, justifyContent: 'center', alignItems: 'center', gap: 21 }}>
    <Text style={{ fontFamily: 'Ubuntu_400Regular', color: c.textDim, fontSize: 16, lineHeight: 25, textAlign: 'center' }}>{message}</Text>
    {retry ? <ScalePressable onPress={retry} style={{ borderWidth: 1, borderColor: c.accent, borderRadius: 12, paddingHorizontal: 26, paddingVertical: 13 }}><Text style={{ fontFamily: 'Ubuntu_700Bold', color: c.accent }}>Try again</Text></ScalePressable> : null}
  </View>;
}
export function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  const c = useThemeColors();
  return <View style={{ paddingHorizontal: 24, paddingTop: 29, paddingBottom: 20, gap: 7 }}>
    <Eyebrow>B SQUARE / MEMBERS ONLY</Eyebrow>
    <Text style={{ fontFamily: 'Ubuntu_700Bold', fontSize: 31, letterSpacing: -0.6, color: c.text, marginTop: 7 }}>{title}</Text>
    {subtitle ? <Text style={{ fontFamily: 'Ubuntu_400Regular', fontSize: 14, lineHeight: 20, color: c.textDim }}>{subtitle}</Text> : null}
  </View>;
}
