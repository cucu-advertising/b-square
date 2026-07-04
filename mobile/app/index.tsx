import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useThemeColors } from '../lib/theme';
import { useReducedMotion } from '../hooks/useReducedMotion';

export default function SplashScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const logoScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.35);
  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0.5);
  const sealRotation = useSharedValue(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 1800);
    return () => clearTimeout(timer);
  }, [router]);

  useEffect(() => {
    if (reduceMotion) return;

    logoScale.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.65, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.25, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );

    ringScale.value = withRepeat(
      withSequence(
        withTiming(1.35, { duration: 2200, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 0 }),
      ),
      -1,
    );

    ringOpacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 2200, easing: Easing.out(Easing.ease) }),
        withTiming(0.5, { duration: 0 }),
      ),
      -1,
    );

    sealRotation.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1,
    );
  }, [reduceMotion, logoScale, glowOpacity, ringScale, ringOpacity, sealRotation]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    shadowOpacity: glowOpacity.value,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  const decorativeRingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sealRotation.value}deg` }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.void }]}>
      <Animated.View
        style={[
          styles.decorativeRing,
          {
            width: 180,
            height: 180,
            borderRadius: 90,
          },
          decorativeRingStyle,
        ]}
      >
        <LinearGradient
          colors={[colors.holoA, colors.holoB, colors.accent, colors.gradientEnd, colors.holoA]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.ring,
          { borderColor: colors.gradientStart },
          ringStyle,
        ]}
      />

      <Animated.View
        style={[
          styles.logoShadow,
          {
            shadowColor: colors.gradientStart,
          },
          logoStyle,
        ]}
      >
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logo}
        >
          <Text style={[styles.wordmark, { color: colors.text }]}>B²</Text>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decorativeRing: {
    position: 'absolute',
    overflow: 'hidden',
    opacity: 0.25,
  },
  ring: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
  },
  logoShadow: {
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 28,
    elevation: 12,
  },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 36,
  },
});
