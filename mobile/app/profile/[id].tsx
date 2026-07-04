import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { ArrowLeft, Bookmark, Sparkles, Building2, Calendar, Users, Navigation } from 'lucide-react-native';
import { Screen } from '@/components/Screen';
import { GlassCard } from '@/components/GlassCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { GhostButton } from '@/components/GhostButton';
import { PressableScale } from '@/components/PressableScale';
import { VerifiedSeal } from '@/components/VerifiedSeal';
import { useTheme } from '@/lib/theme';
import { Fonts } from '@/lib/typography';
import { PROFILES } from '@/lib/mockData';
import { useAppStore, useToastStore } from '@/lib/store';

export default function ProfileDetail() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const profile = PROFILES.find((p) => p.id === id) ?? PROFILES[0];

  const requested = useAppStore((s) => s.sentIds.includes(profile.id));
  const requestIntro = useAppStore((s) => s.requestIntro);
  const showToast = useToastStore((s) => s.show);

  const facts = [
    { icon: Building2, label: 'Industry', value: profile.industry },
    { icon: Calendar, label: 'Founded', value: String(profile.founded) },
    { icon: Users, label: 'Team size', value: profile.teamSize },
    { icon: Navigation, label: 'Distance', value: `${profile.distanceKm.toFixed(1)} km` },
  ];

  const onIntro = () => {
    if (requested) return;
    requestIntro(profile.id);
    showToast('Intro requested ✓');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.void }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        {/* Hero */}
        <LinearGradient colors={[colors.heroA, colors.heroB]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={{ paddingTop: insets.top + 8 }}>
            <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
              <Defs>
                <RadialGradient id="glow" cx="70%" cy="20%" r="60%">
                  <Stop offset="0" stopColor={colors.gradientStart} stopOpacity={0.5} />
                  <Stop offset="1" stopColor={colors.gradientStart} stopOpacity={0} />
                </RadialGradient>
              </Defs>
              <Circle cx="75%" cy="18%" r="180" fill="url(#glow)" />
            </Svg>

            <View style={styles.heroContent}>
              <PressableScale
                onPress={() => router.back()}
                scaleTo={0.9}
                style={[styles.backBtn, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
              >
                <ArrowLeft size={20} color={colors.text} strokeWidth={2.2} />
              </PressableScale>

              <View style={styles.heroNameRow}>
                <Text style={[styles.heroName, { color: colors.text }]}>{profile.name}</Text>
                {profile.verified && <VerifiedSeal size={28} />}
              </View>
              <Text style={[styles.heroRole, { color: colors.textDim }]}>{profile.role}</Text>

              {profile.verified && (
                <View style={[styles.verifiedPill, { backgroundColor: colors.glowSoft, borderColor: colors.accent }]}>
                  <Text style={[styles.verifiedText, { color: colors.accent }]}>VERIFIED · GSTIN CHECKED</Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* Fact grid */}
        <View style={styles.content}>
          <View style={styles.grid}>
            {facts.map((f) => {
              const Icon = f.icon;
              return (
                <View key={f.label} style={styles.gridItem}>
                  <GlassCard>
                    <Icon size={18} color={colors.textDim} strokeWidth={2} />
                    <Text style={[styles.factLabel, { color: colors.textFaint }]}>{f.label.toUpperCase()}</Text>
                    <Text style={[styles.factValue, { color: colors.text }]}>{f.value}</Text>
                  </GlassCard>
                </View>
              );
            })}
          </View>

          {/* Looking for / Can offer — most important content */}
          <View style={[styles.intent, { borderColor: colors.glassBorder, backgroundColor: colors.glass }]}>
            <View style={styles.intentBlock}>
              <View style={styles.intentHead}>
                <Sparkles size={16} color={colors.accent} strokeWidth={2.2} />
                <Text style={[styles.intentLabel, { color: colors.text }]}>Looking for</Text>
              </View>
              <Text style={[styles.intentBody, { color: colors.textDim }]}>{profile.lookingFor}</Text>
            </View>

            <View style={[styles.intentDivider, { backgroundColor: colors.glassBorder }]} />

            <View style={styles.intentBlock}>
              <View style={styles.intentHead}>
                <Sparkles size={16} color={colors.gradientEnd} strokeWidth={2.2} />
                <Text style={[styles.intentLabel, { color: colors.text }]}>Can offer</Text>
              </View>
              <Text style={[styles.intentBody, { color: colors.textDim }]}>{profile.canOffer}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky bottom CTA */}
      <View style={[styles.cta, { paddingBottom: insets.bottom + 14, backgroundColor: colors.void, borderTopColor: colors.glassBorder }]}>
        <PrimaryButton
          label={requested ? 'Intro requested' : 'Request intro'}
          variant="accent"
          onPress={onIntro}
          disabled={requested}
          style={{ flex: 1 }}
        />
        <GhostButton label="Save" icon={<Bookmark size={16} color={colors.text} strokeWidth={2} />} style={{ flex: 0.6 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroContent: { paddingHorizontal: 24, paddingBottom: 30 },
  backBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  heroNameRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 26 },
  heroName: { fontFamily: Fonts.displayBold, fontSize: 30, flexShrink: 1 },
  heroRole: { fontFamily: Fonts.bodyRegular, fontSize: 15.5, marginTop: 6 },
  verifiedPill: { alignSelf: 'flex-start', marginTop: 16, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1 },
  verifiedText: { fontFamily: Fonts.monoMedium, fontSize: 10.5, letterSpacing: 1 },
  content: { paddingHorizontal: 20, paddingTop: 22 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { width: '47.5%', flexGrow: 1 },
  factLabel: { fontFamily: Fonts.monoMedium, fontSize: 9.5, letterSpacing: 0.8, marginTop: 12 },
  factValue: { fontFamily: Fonts.displaySemiBold, fontSize: 18, marginTop: 4 },
  intent: { borderRadius: 22, borderWidth: 1, padding: 20, marginTop: 16, gap: 18 },
  intentBlock: { gap: 8 },
  intentHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  intentLabel: { fontFamily: Fonts.displaySemiBold, fontSize: 16 },
  intentBody: { fontFamily: Fonts.bodyRegular, fontSize: 15, lineHeight: 22 },
  intentDivider: { height: StyleSheet.hairlineWidth },
  cta: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
