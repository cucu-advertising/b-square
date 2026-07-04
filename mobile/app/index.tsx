import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { HoloRing } from '../components/HoloRing';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { fonts } from '../lib/fonts';
import { useTheme } from '../lib/theme';

export default function SplashScreen() {
  const theme = useTheme();
  const router = useRouter();
  const reducedMotion = useReducedMotion();

  const glowScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.5);
  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0.6);

  useEffect(() => {
    const timer = setTimeout(() => router.replace('/login'), 1800);
    return () => clearTimeout(timer);
  }, [router]);

  useEffect(() => {
    if (reducedMotion) return;

    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.5, { duration: 1100, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
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

    return () => {
      cancelAnimation(glowScale);
      cancelAnimation(glowOpacity);
      cancelAnimation(ringScale);
      cancelAnimation(ringOpacity);
    };
  }, [reducedMotion, glowScale, glowOpacity, ringScale, ringOpacity]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    shadowOpacity: glowOpacity.value,
  }));

  const pulseRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.void }]}>
      <View style={styles.stack}>
        <View style={styles.holoWrap}>
          <HoloRing size={220} durationMs={9000} />
        </View>

        <Animated.View
          pointerEvents="none"
          style={[
            styles.pulseRing,
            { borderColor: theme.colors.gradientStart },
            pulseRingStyle,
          ]}
        />

        <Animated.View style={[logoStyle, { shadowColor: theme.colors.glow }]}>
          <LinearGradient
            colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logo}
          >
            <Text style={styles.logoText}>B²</Text>
          </LinearGradient>
        </Animated.View>
      </View>

      <Text style={[styles.wordmark, { color: theme.colors.text }]}>B SQUARE</Text>
      <Text style={[styles.tagline, { color: theme.colors.textFaint }]}>
        VERIFIED BUSINESS NETWORKING
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stack: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 220,
    width: 220,
    marginBottom: 28,
  },
  holoWrap: {
    position: 'absolute',
  },
  pulseRing: {
    position: 'absolute',
    width: 108,
    height: 108,
    borderRadius: 28,
    borderWidth: 1.5,
  },
  logo: {
    width: 92,
    height: 92,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 10,
  },
  logoText: {
    fontFamily: fonts.display700,
    fontSize: 34,
    color: '#FFFFFF',
  },
  wordmark: {
    fontFamily: fonts.display700,
    fontSize: 22,
    letterSpacing: 2,
  },
  tagline: {
    fontFamily: fonts.mono400,
    fontSize: 11,
    letterSpacing: 1.6,
    marginTop: 8,
  },
});
