import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const SPRING = { damping: 16, stiffness: 260, mass: 0.5 };

/**
 * Shared physical press-feedback used by every Pressable button/card in the app.
 * Scales down on press-in, springs back on press-out.
 */
export function usePressScale(target = 0.96) {
  const scale = useSharedValue(1);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(target, SPRING);
  };
  const onPressOut = () => {
    scale.value = withSpring(1, SPRING);
  };

  return { style, onPressIn, onPressOut };
}
