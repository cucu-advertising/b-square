import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VerifiedSeal } from '../../components/VerifiedSeal';
import { GlassCard } from '../../components/GlassCard';
import { ScalePressable } from '../../components/AnimatedUI';
import { useThemeColors } from '../../lib/theme';
import { NEARBY_BUSINESSES } from '../../lib/mockData';

export default function ProfileDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const profile = NEARBY_BUSINESSES.find((b) => b.id === id);

  if (!profile) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.void }]}>
        <Text style={{ color: colors.text }}>Profile not found</Text>
      </View>
    );
  }

  const facts = [
    { label: 'INDUSTRY', value: profile.industry },
    { label: 'FOUNDED', value: profile.founded },
    { label: 'TEAM SIZE', value: profile.teamSize },
    { label: 'DISTANCE', value: profile.distance },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.void }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[colors.heroA, colors.heroB]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + 12 }]}
        >
          <View
            style={[
              styles.glowBlob,
              { backgroundColor: colors.glowSoft },
            ]}
          />

          <ScalePressable
            onPress={() => router.back()}
            style={[
              styles.backBtn,
              {
                backgroundColor: colors.glass,
                borderColor: colors.glassBorder,
              },
            ]}
            scaleTo={0.94}
          >
            <ArrowLeft size={20} color={colors.text} strokeWidth={1.75} />
          </ScalePressable>

          <View style={styles.heroContent}>
            <View style={styles.nameRow}>
              <View style={styles.nameBlock}>
                <Text style={[styles.name, { color: colors.text }]}>{profile.name}</Text>
                <Text style={[styles.role, { color: colors.textDim }]}>
                  {profile.role}, {profile.business}
                </Text>
              </View>
              <VerifiedSeal size={40} />
            </View>

            <View
              style={[
                styles.verifiedPill,
                {
                  backgroundColor: `${colors.accent}18`,
                  borderColor: `${colors.accent}40`,
                },
              ]}
            >
              <Text style={[styles.verifiedText, { color: colors.accent }]}>
                VERIFIED · GSTIN CHECKED
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          <View style={styles.factGrid}>
            {facts.map((fact) => (
              <GlassCard key={fact.label} style={styles.factCard}>
                <Text style={[styles.factLabel, { color: colors.textFaint }]}>{fact.label}</Text>
                <Text style={[styles.factValue, { color: colors.text }]}>{fact.value}</Text>
              </GlassCard>
            ))}
          </View>

          <View
            style={[
              styles.offerBlock,
              {
                backgroundColor: colors.glass,
                borderColor: colors.glassBorder,
              },
            ]}
          >
            <Text style={[styles.offerLabel, { color: colors.text }]}>Looking for</Text>
            <Text style={[styles.offerText, { color: colors.textDim }]}>
              {profile.lookingFor}
            </Text>

            <Text style={[styles.offerLabel, { color: colors.text, marginTop: 20 }]}>
              Can offer
            </Text>
            <Text style={[styles.offerText, { color: colors.textDim }]}>
              {profile.canOffer}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.ctaRow,
          {
            paddingBottom: insets.bottom + 16,
            backgroundColor: colors.void,
            borderTopColor: colors.glassBorder,
          },
        ]}
      >
        <ScalePressable
          style={[styles.ctaPrimary, { backgroundColor: colors.accent }]}
          scaleTo={0.96}
        >
          <Text style={[styles.ctaPrimaryText, { color: colors.onAccent }]}>Request intro</Text>
        </ScalePressable>
        <ScalePressable
          style={[
            styles.ctaGhost,
            {
              backgroundColor: colors.glass,
              borderColor: colors.glassBorder,
            },
          ]}
          scaleTo={0.96}
        >
          <Text style={[styles.ctaGhostText, { color: colors.text }]}>Save</Text>
        </ScalePressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    overflow: 'hidden',
  },
  glowBlob: {
    position: 'absolute',
    top: -40,
    right: -20,
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.6,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  heroContent: {
    gap: 16,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameBlock: {
    flex: 1,
    paddingRight: 16,
    gap: 4,
  },
  name: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28,
  },
  role: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
  },
  verifiedPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  verifiedText: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 10,
    letterSpacing: 1.2,
  },
  body: {
    padding: 20,
    gap: 20,
  },
  factGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  factCard: {
    width: '47%',
    padding: 14,
    gap: 6,
  },
  factLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    letterSpacing: 1.2,
  },
  factValue: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 16,
  },
  offerBlock: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 20,
  },
  offerLabel: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 14,
    marginBottom: 6,
  },
  offerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  ctaRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
    borderTopWidth: 1,
  },
  ctaPrimary: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  ctaPrimaryText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
  ctaGhost: {
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  ctaGhostText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
  },
});
