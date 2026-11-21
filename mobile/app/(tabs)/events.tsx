import { CalendarDays } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { useThemeColors } from '../../lib/theme';
import { Eyebrow } from '../../components/BrandUI';
import { SectionHeading } from '../../components/ScreenStates';

export default function EventsScreen() {
  const c = useThemeColors();
  return <View style={{ flex: 1, backgroundColor: c.void }}>
    <SectionHeading title="Events." subtitle="Meet beyond the screen." />
    <View style={{ flex: 1, paddingHorizontal: 22, justifyContent: 'center', paddingBottom: 75 }}>
      <View style={{ backgroundColor: c.surface, borderWidth: 1, borderColor: c.glassBorder, padding: 26, borderRadius: 20 }}>
        <CalendarDays size={40} color={c.accent} strokeWidth={1.4} />
        <View style={{ marginTop: 26 }}><Eyebrow>COMING SOON</Eyebrow></View>
        <Text style={{ fontFamily: 'Ubuntu_700Bold', color: c.text, fontSize: 31, lineHeight: 38, marginTop: 14 }}>Better connections, in person.</Text>
        <Text style={{ fontFamily: 'Ubuntu_400Regular', color: c.textDim, fontSize: 15, lineHeight: 25, marginTop: 14 }}>We're preparing a space to discover and attend business meetups. Event discovery and ticketing aren't live yet.</Text>
      </View>
    </View>
  </View>;
}
