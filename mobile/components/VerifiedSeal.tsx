import { LinearGradient } from 'expo-linear-gradient';
import { Check } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useTheme } from '../lib/theme';

type Props = {
  size?: number;
  /** Fraction of size used for the outer holo ring. Defaults to a slim ring. */
  ringRatio?: number;
};

/**
 * The signature "seal" — a rotating conic-gradient ring around a solid inner
 * circle with a checkmark. React Native has no native conic/sweep gradient,
 * so we approximate it with an oversized rotating linear gradient clipped to
 * a circle, which reads as a shifting holographic ring at seal sizes.
 */
export function VerifiedSeal({ size = 28, ringRatio = 0.16 }: Props) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) {
      cancelAnimation(rotation);
      rotation.value = 0;
      return;
    }
    rotation.value = withRepeat(
      withTiming(360, { duration: 5500, easing: Easing.linear }),
      -1,
      false
    );
    return () => cancelAnimation(rotation);
  }, [reducedMotion, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const ringWidth = Math.max(2, size * ringRatio);
  const innerSize = size - ringWidth * 2;
  const gradientSize = size * 1.6;

  return (
    <View style={[styles.outer, { width: size, height: size, borderRadius: size / 2 }]}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: gradientSize,
            height: gradientSize,
            left: (size - gradientSize) / 2,
            top: (size - gradientSize) / 2,
          },
          animatedStyle,
        ]}
      >
        <LinearGradient
          colors={[theme.colors.holoA, theme.colors.holoB, theme.colors.accent, theme.colors.gradientEnd, theme.colors.holoA]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <View
        style={[
          styles.inner,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            backgroundColor: theme.colors.voidAlt,
          },
        ]}
      >
        <Check size={innerSize * 0.58} color={theme.colors.accent} strokeWidth={3} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
