import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, ArrowUpRight, Check } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { GlassCard } from './GlassCard';
import { PressableScale } from './PressableScale';
import { PrimaryButton } from './PrimaryButton';
import { GhostButton } from './GhostButton';
import { VerifiedSeal } from './VerifiedSeal';
import { Pill } from './ui';
import { useTheme } from '@/lib/theme';
import { Fonts } from '@/lib/typography';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useAppStore } from '@/lib/store';
import { useToastStore } from '@/lib/store';
import type { BusinessProfile } from '@/lib/mockData';

type Props = { profile: BusinessProfile; index: number };

/** A verified business row in Nearby. Enters with a staggered fade + slide. */
export function BusinessCard({ profile, index }: Props) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const router = useRouter();

  const connected = useAppStore((s) => s.sentIds.includes(profile.id));
  const connect = useAppStore((s) => s.connect);
  const showToast = useToastStore((s) => s.show);

  const opacity = useSharedValue(reduced ? 1 : 0);
  const translateY = useSharedValue(reduced ? 0 : 14);

  useEffect(() => {
    if (reduced) {
      opacity.value = 1;
      translateY.value = 0;
      return;
    }
    const delay = index * 60;
    opacity.value = withDelay(delay, withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 420, easing: Easing.out(Easing.cubic) }));
  }, [index, reduced, opacity, translateY]);

  const entrance = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const openDetail = () => router.push(`/profile/${profile.id}`);

  const onConnect = () => {
    if (connected) return;
    connect(profile.id);
    showToast('Request sent ✓');
  };

  return (
    <Animated.View style={entrance}>
      <PressableScale onPress={openDetail} scaleTo={0.985}>
        <GlassCard>
          <View style={styles.headerRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <View style={styles.nameRow}>
                <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                  {profile.name}
                </Text>
                {profile.verified && (
                  <PressableScale onPress={openDetail} hitSlop={8}>
                    <VerifiedSeal size={22} />
                  </PressableScale>
                )}
              </View>
              <Text style={[styles.role, { color: colors.textDim }]} numberOfLines={1}>
                {profile.role}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Pill>{profile.industry}</Pill>
            <Text style={[styles.distance, { color: colors.textFaint }]}>
              {profile.distanceKm.toFixed(1)} KM
            </Text>
          </View>

          <View style={styles.actions}>
            <PrimaryButton
              label={connected ? 'Requested' : 'Connect'}
              variant="accent"
              onPress={onConnect}
              disabled={connected}
              style={{ flex: 1 }}
              icon={
                connected ? (
                  <Check size={17} color={colors.onAccent} strokeWidth={2.5} />
                ) : (
                  <Plus size={17} color={colors.onAccent} strokeWidth={2.5} />
                )
              }
            />
            <GhostButton
              label="View card"
              onPress={openDetail}
              style={{ flex: 1 }}
              icon={<ArrowUpRight size={16} color={colors.text} strokeWidth={2} />}
            />
          </View>
        </GlassCard>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'flex-start' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontFamily: Fonts.displaySemiBold, fontSize: 18, flexShrink: 1 },
  role: { fontFamily: Fonts.bodyRegular, fontSize: 13.5, marginTop: 3 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14 },
  distance: { fontFamily: Fonts.monoMedium, fontSize: 12, letterSpacing: 0.5 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 16 },
});
