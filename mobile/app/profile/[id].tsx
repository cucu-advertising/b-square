import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eyebrow } from '../../components/Eyebrow';
import { GhostButton } from '../../components/GhostButton';
import { GlassCard } from '../../components/GlassCard';
import { GlowBlob } from '../../components/GlowBlob';
import { PrimaryButton } from '../../components/PrimaryButton';
import { showToast } from '../../components/Toast';
import { VerifiedSeal } from '../../components/VerifiedSeal';
import { usePressScale } from '../../hooks/usePressScale';
import { fonts } from '../../lib/fonts';
import { BUSINESSES } from '../../lib/mockData';
import { useTheme } from '../../lib/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function FactCard({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <GlassCard radius={16} style={styles.factCard}>
      <View style={styles.factInner}>
        <Text style={[styles.factLabel, { color: theme.colors.textFaint }]}>{label}</Text>
        <Text style={[styles.factValue, { color: theme.colors.text }]}>{value}</Text>
      </View>
    </GlassCard>
  );
}

export default function ProfileDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { style: backStyle, onPressIn: backIn, onPressOut: backOut } = usePressScale(0.9);

  const business = BUSINESSES.find((b) => b.id === id);

  if (!business) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.void }]}>
        <Text style={{ color: theme.colors.text, padding: 24 }}>Profile not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.void }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[theme.colors.heroA, theme.colors.heroB]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <GlowBlob size={320} color={theme.colors.glow} style={styles.glowBlob} />
          <SafeAreaView edges={['top']}>
            <AnimatedPressable
              onPress={() => router.back()}
              onPressIn={backIn}
              onPressOut={backOut}
              style={[
                backStyle,
                styles.backButton,
                { backgroundColor: theme.colors.glass, borderColor: theme.colors.glassBorder },
              ]}
            >
              <ArrowLeft size={20} color={theme.colors.text} />
            </AnimatedPressable>
          </SafeAreaView>

          <View style={styles.heroContent}>
            <View style={styles.heroNameRow}>
              <Text style={[styles.heroName, { color: theme.colors.text }]}>{business.name}</Text>
              <VerifiedSeal size={26} />
            </View>
            <Text style={[styles.heroRole, { color: theme.colors.textDim }]}>{business.role}</Text>

            <View
              style={[
                styles.verifiedPill,
                { backgroundColor: `${theme.colors.accent}22`, borderColor: theme.colors.accent },
              ]}
            >
              <Text style={[styles.verifiedPillText, { color: theme.colors.accent }]}>
                VERIFIED · GSTIN CHECKED
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          <View style={styles.factGrid}>
            <FactCard label="INDUSTRY" value={business.industry} />
            <FactCard label="FOUNDED" value={String(business.founded)} />
            <FactCard label="TEAM SIZE" value={business.teamSize} />
            <FactCard label="DISTANCE" value={`${business.distanceKm.toFixed(1)} km`} />
          </View>

          <View style={styles.infoSection}>
            <Eyebrow style={styles.infoEyebrow}>Looking for</Eyebrow>
            <Text style={[styles.infoText, { color: theme.colors.text }]}>{business.lookingFor}</Text>
          </View>

          <View style={styles.infoSection}>
            <Eyebrow color={theme.colors.holoA} style={styles.infoEyebrow}>
              Can offer
            </Eyebrow>
            <Text style={[styles.infoText, { color: theme.colors.text }]}>{business.canOffer}</Text>
          </View>
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={[styles.ctaBar, { backgroundColor: theme.colors.void, borderTopColor: theme.colors.glassBorder }]}>
        <PrimaryButton
          label="Request intro"
          variant="accent"
          onPress={() => showToast('Intro request sent ✓')}
          style={styles.ctaPrimary}
        />
        <GhostButton label="Save" onPress={() => showToast('Saved to your list')} style={styles.ctaGhost} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  hero: {
    paddingBottom: 28,
    overflow: 'hidden',
  },
  glowBlob: {
    position: 'absolute',
    top: -60,
    right: -80,
  },
  backButton: {
    marginLeft: 20,
    marginTop: 4,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: {
    paddingHorizontal: 24,
    marginTop: 24,
    gap: 8,
  },
  heroNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroName: {
    fontFamily: fonts.display700,
    fontSize: 26,
  },
  heroRole: {
    fontFamily: fonts.body400,
    fontSize: 15,
  },
  verifiedPill: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 10,
  },
  verifiedPillText: {
    fontFamily: fonts.mono500,
    fontSize: 10.5,
    letterSpacing: 0.8,
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 28,
  },
  factGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  factCard: {
    width: '47.5%',
  },
  factInner: {
    padding: 16,
    gap: 6,
  },
  factLabel: {
    fontFamily: fonts.mono400,
    fontSize: 10.5,
    letterSpacing: 0.8,
  },
  factValue: {
    fontFamily: fonts.display600,
    fontSize: 17,
  },
  infoSection: {
    gap: 8,
  },
  infoEyebrow: {
    marginBottom: 2,
  },
  infoText: {
    fontFamily: fonts.body600,
    fontSize: 16,
    lineHeight: 24,
  },
  ctaBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  ctaPrimary: {
    flex: 1.4,
  },
  ctaGhost: {
    flex: 1,
  },
});
