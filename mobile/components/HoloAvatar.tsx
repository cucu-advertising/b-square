import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { fonts } from '../lib/fonts';
import { useTheme } from '../lib/theme';

type Props = {
  size?: number;
  initials: string;
};

/** Rotating holo-ring avatar placeholder, used on onboarding + self profile. */
export function HoloAvatar({ size = 96, initials }: Props) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) {
      cancelAnimation(rotation);
      rotation.value = 0;
      return;
    }
    rotation.value = withRepeat(withTiming(360, { duration: 6000, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(rotation);
  }, [reducedMotion, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const ringWidth = Math.max(3, size * 0.06);
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
        <Text style={[styles.initials, { color: theme.colors.text, fontSize: size * 0.32 }]}>
          {initials}
        </Text>
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
  initials: {
    fontFamily: fonts.display700,
  },
});
