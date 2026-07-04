import { LinearGradient } from 'expo-linear-gradient';
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
  ringWidth?: number;
  durationMs?: number;
};

/**
 * Larger, slower decorative sibling of VerifiedSeal's rotating ring — used on
 * the splash screen behind the logo mark. Same "oversized rotating gradient
 * clipped to a circle" technique used to approximate a conic gradient.
 */
export function HoloRing({ size = 220, ringWidth = 3, durationMs = 9000 }: Props) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) {
      cancelAnimation(rotation);
      rotation.value = 0;
      return;
    }
    rotation.value = withRepeat(withTiming(360, { duration: durationMs, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(rotation);
  }, [reducedMotion, rotation, durationMs]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

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
        style={{
          width: innerSize,
          height: innerSize,
          borderRadius: innerSize / 2,
          backgroundColor: theme.colors.void,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    opacity: 0.5,
  },
});
