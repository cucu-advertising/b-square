import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, Clock, MapPin, Pencil } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VerifiedSeal } from '../../components/VerifiedSeal';
import { ScalePressable } from '../../components/AnimatedUI';
import { useThemeColors } from '../../lib/theme';
import { SELF_PROFILE } from '../../lib/mockData';
import { useAuthStore } from '../../lib/store';

export default function ProfileScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const businessName = useAuthStore((s) => s.businessName);
  const displayBusiness = businessName || SELF_PROFILE.business;

  const menuItems = [
    { icon: Pencil, label: 'Edit business card', value: 'Update' },
    { icon: MapPin, label: 'Networking radius', value: SELF_PROFILE.networkingRadius },
    { icon: Clock, label: 'Active hours', value: SELF_PROFILE.activeHours },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.void }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      <LinearGradient
        colors={[colors.heroA, colors.heroB]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + 24 }]}
      >
        <View style={styles.sealWrap}>
          <VerifiedSeal size={36} />
        </View>

        <Text style={[styles.name, { color: colors.text }]}>{SELF_PROFILE.name}</Text>
        <Text style={[styles.role, { color: colors.textDim }]}>
          {SELF_PROFILE.role}, {displayBusiness}
        </Text>

        <View style={styles.stats}>
          <StatBlock
            value={String(SELF_PROFILE.connections)}
            label="CONNECTIONS"
            colors={colors}
          />
          <StatBlock value={String(SELF_PROFILE.introsMade)} label="INTROS MADE" colors={colors} />
          <StatBlock value={String(SELF_PROFILE.trustScore)} label="TRUST SCORE" colors={colors} />
        </View>
      </LinearGradient>

      <View style={styles.menu}>
        {menuItems.map((item, index) => (
          <ScalePressable
            key={item.label}
            style={[
              styles.menuRow,
              {
                borderBottomColor: colors.glassBorder,
                borderBottomWidth: index < menuItems.length - 1 ? 1 : 0,
              },
            ]}
            scaleTo={0.98}
          >
            <item.icon size={20} color={colors.textDim} strokeWidth={1.75} />
            <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
            <Text style={[styles.menuValue, { color: colors.textFaint }]}>{item.value}</Text>
            <ChevronRight size={18} color={colors.textFaint} strokeWidth={1.75} />
          </ScalePressable>
        ))}
      </View>
    </ScrollView>
  );
}

function StatBlock({
  value,
  label,
  colors,
}: {
  value: string;
  label: string;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color: colors.accent }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textFaint }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  sealWrap: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  name: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28,
  },
  role: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    marginTop: 4,
  },
  stats: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 8,
  },
  stat: {
    flex: 1,
    gap: 4,
  },
  statValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 22,
  },
  statLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 9,
    letterSpacing: 1.2,
  },
  menu: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    gap: 14,
  },
  menuLabel: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
  },
  menuValue: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    marginRight: 4,
  },
});
