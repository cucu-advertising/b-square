import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '@/lib/theme';
import { Fonts } from '@/lib/typography';
import { useToastStore } from '@/lib/store';

/** Bottom-anchored pill toast: slides up + fades in, auto-dismisses ~1.8s. */
export function Toast() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const message = useToastStore((s) => s.message);
  const hide = useToastStore((s) => s.hide);

  const progress = useSharedValue(0);

  useEffect(() => {
    if (message) {
      progress.value = withTiming(1, { duration: 260, easing: Easing.out(Easing.cubic) });
      const timer = setTimeout(() => {
        progress.value = withTiming(0, { duration: 240, easing: Easing.in(Easing.cubic) }, (done) => {
          if (done) runOnJS(hide)();
        });
      }, 1800);
      return () => clearTimeout(timer);
    }
    progress.value = 0;
  }, [message, progress, hide]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 24 }],
  }));

  if (!message) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.container, { bottom: insets.bottom + 90 }, style]}
    >
      <BlurView intensity={40} tint="dark" style={styles.blur}>
        <Text style={[styles.text, { color: colors.text, borderColor: colors.glassBorder }]}>
          {message}
        </Text>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 100 },
  blur: { borderRadius: 999, overflow: 'hidden' },
  text: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    overflow: 'hidden',
  },
});
