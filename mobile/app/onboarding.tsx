import { useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, LockKeyhole, Users, Handshake } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandMark, Eyebrow } from '../components/BrandUI';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScalePressable } from '../components/AnimatedUI';
import { useThemeColors } from '../lib/theme';

const pages = [
  { eyebrow: 'A NETWORK WITH INTENTION', heading: 'Good business.', highlight: 'Better people.', body: 'Meet the people who move your business forward.' },
  { eyebrow: '01 / WHY B SQUARE', heading: 'Not another feed.', highlight: 'A better circle.', body: 'A considered space for real conversations and meaningful introductions.' },
  { eyebrow: '02 / VERIFIED CONNECTIONS', heading: 'The right people.', highlight: 'Not just more people.', body: 'A curated community designed for founders and business owners.' },
  { eyebrow: '03 / YOUR NEXT INTRODUCTION', heading: 'Your next big move', highlight: 'starts with a hello.', body: 'Discover people, build connections and meet beyond the screen.' },
];

export default function Onboarding() {
  const [page, setPage] = useState(0);
  const router = useRouter();
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const step = pages[page];
  const last = page === pages.length - 1;
  return <View style={{ flex: 1, backgroundColor: c.void, paddingTop: insets.top + 26, paddingBottom: Math.max(insets.bottom + 20, 30), paddingHorizontal: 26 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <BrandMark size={35} />
      <ScalePressable accessibilityRole="button" onPress={() => router.replace('/login')} style={{ paddingVertical: 12, paddingHorizontal: 6 }}>
        <Text style={{ color: c.textDim, fontFamily: 'Ubuntu_500Medium', fontSize: 13 }}>Skip</Text>
      </ScalePressable>
    </View>
    <View style={{ marginTop: 78, flex: 1 }}>
      <Eyebrow>{step.eyebrow}</Eyebrow>
      <Text style={{ marginTop: 26, color: c.text, fontFamily: 'Ubuntu_700Bold', fontSize: 47, lineHeight: 54, letterSpacing: -1.4 }}>{step.heading}</Text>
      <Text style={{ color: c.accent, fontFamily: 'Ubuntu_700Bold', fontSize: 47, lineHeight: 54, letterSpacing: -1.4 }}>{step.highlight}</Text>
      <Text style={{ color: c.textDim, fontFamily: 'Ubuntu_400Regular', fontSize: 17, lineHeight: 26, marginTop: 28, maxWidth: 290 }}>{step.body}</Text>
      <View style={{ flexDirection: 'row', marginTop: 60, alignItems: 'center', gap: 18 }}>
        {page === 1 ? <Handshake size={41} color={c.accent} strokeWidth={1.35} /> : page === 2 ? <LockKeyhole size={41} color={c.accent} strokeWidth={1.35} /> : page === 3 ? <Users size={41} color={c.accent} strokeWidth={1.35} /> : null}
      </View>
    </View>
    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 30 }}>
      {pages.map((p, i) => <View key={p.eyebrow} style={{ backgroundColor: i === page ? c.accent : c.glassBorder, width: i === page ? 32 : 8, height: 5, borderRadius: 9 }} />)}
    </View>
    <PrimaryButton label={last ? 'Join B Square' : 'Continue'} onPress={() => last ? router.push('/register') : setPage(v => v + 1)} />
    {last ? <ScalePressable accessibilityRole="button" onPress={() => router.replace('/login')} style={{ padding: 17, alignItems: 'center' }}><Text style={{ color: c.textDim, fontFamily: 'Ubuntu_500Medium' }}>Already a member? Sign in</Text></ScalePressable> : <ScalePressable accessibilityRole="button" onPress={() => page > 0 ? setPage(v => v - 1) : router.replace('/login')} style={{ padding: 15, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7 }}><ArrowLeft size={15} color={c.textDim} /><Text style={{ color: c.textDim, fontFamily: 'Ubuntu_500Medium' }}>Back</Text></ScalePressable>}
  </View>;
}
