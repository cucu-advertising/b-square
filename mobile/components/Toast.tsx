import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../lib/theme';
import { useToastStore } from '../lib/store';

export function Toast() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const message = useToastStore((s) => s.message);
  const hideToast = useToastStore((s) => s.hideToast);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(24);

  useEffect(() => {
    if (!message) return;

    opacity.value = withSpring(1, { damping: 18, stiffness: 220 });
    translateY.value = withSpring(0, { damping: 18, stiffness: 220 });

    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 280 });
      translateY.value = withTiming(24, { duration: 280 }, (finished) => {
        if (finished) {
          runOnJS(hideToast)();
        }
      });
    }, 1800);

    return () => clearTimeout(timer);
  }, [message, hideToast, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!message) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          bottom: insets.bottom + 24,
          backgroundColor: colors.surface,
          borderColor: colors.glassBorder,
          shadowColor: colors.glow,
        },
        animatedStyle,
      ]}
    >
      <Text style={[styles.text, { color: colors.text }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 999,
  },
  text: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
});
