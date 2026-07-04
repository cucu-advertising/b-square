import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Screen } from '@/components/Screen';
import { ConicGradientRing } from '@/components/ConicGradientRing';
import { useTheme } from '@/lib/theme';
import { Fonts } from '@/lib/typography';
import { useReducedMotion } from '@/lib/useReducedMotion';
import type { ColorStop } from '@/lib/color';

export default function Splash() {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const router = useRouter();

  const glow = useSharedValue(0);
  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0.5);

  useEffect(() => {
    if (!reduced) {
      // Breathing glow.
      glow.value = withRepeat(
        withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      // Expanding ring pulse.
      ringScale.value = withRepeat(
        withTiming(1.35, { duration: 2200, easing: Easing.out(Easing.ease) }),
        -1,
        false
      );
      ringOpacity.value = withRepeat(
        withTiming(0, { duration: 2200, easing: Easing.out(Easing.ease) }),
        -1,
        false
      );
    }
    const t = setTimeout(() => router.replace('/login'), 1800);
    return () => {
      clearTimeout(t);
      cancelAnimation(glow);
      cancelAnimation(ringScale);
      cancelAnimation(ringOpacity);
    };
  }, [reduced, router, glow, ringScale, ringOpacity]);

  const logoStyle = useAnimatedStyle(() => ({
    shadowOpacity: 0.4 + glow.value * 0.5,
    shadowRadius: 24 + glow.value * 22,
    transform: [{ scale: 1 + glow.value * 0.04 }],
  }));

  const pulseRingStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [{ scale: ringScale.value }],
  }));

  const stops: ColorStop[] = [
    { pos: 0, color: colors.holoA },
    { pos: 0.25, color: colors.holoB },
    { pos: 0.5, color: colors.accent },
    { pos: 0.75, color: colors.gradientEnd },
    { pos: 1, color: colors.holoA },
  ];

  return (
    <Screen edges={[]} style={styles.center}>
      <View style={styles.center}>
        {/* Decorative slow conic ring behind the logo. */}
        <View style={styles.ringWrap} pointerEvents="none">
          <ConicGradientRing size={200} thickness={2} stops={stops} duration={9} spin={!reduced} />
        </View>

        {/* Expanding pulse ring. */}
        {!reduced && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.pulseRing,
              { borderColor: colors.gradientStart },
              pulseRingStyle,
            ]}
          />
        )}

        <Animated.View style={[styles.logoShadow, { shadowColor: colors.glow }, logoStyle]}>
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logo}
          >
            <Text style={styles.wordmark}>B²</Text>
          </LinearGradient>
        </Animated.View>

        <Text style={[styles.name, { color: colors.text }]}>B Square</Text>
        <Text style={[styles.tagline, { color: colors.textDim }]}>VERIFIED BUSINESS NETWORK</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  ringWrap: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  pulseRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 40,
    borderWidth: 1.5,
  },
  logoShadow: {
    shadowOffset: { width: 0, height: 0 },
    borderRadius: 30,
  },
  logo: {
    width: 108,
    height: 108,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: { fontFamily: Fonts.displayBold, fontSize: 52, color: '#FFFFFF' },
  name: { fontFamily: Fonts.displaySemiBold, fontSize: 26, marginTop: 34, letterSpacing: 0.5 },
  tagline: { fontFamily: Fonts.monoMedium, fontSize: 10.5, marginTop: 8, letterSpacing: 2.5 },
});
