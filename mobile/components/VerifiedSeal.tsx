import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check } from 'lucide-react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useThemeColors } from '../lib/theme';
import { useReducedMotion } from '../hooks/useReducedMotion';

type VerifiedSealProps = {
  size?: number;
};

export function VerifiedSeal({ size = 28 }: VerifiedSealProps) {
  const colors = useThemeColors();
  const reduceMotion = useReducedMotion();
  const rotation = useSharedValue(0);

  const ringSize = size;
  const innerSize = size * 0.72;
  const checkSize = size * 0.32;
  const borderWidth = Math.max(2, size * 0.1);

  useEffect(() => {
    if (reduceMotion) return;
    rotation.value = withRepeat(
      withTiming(360, { duration: 5500, easing: Easing.linear }),
      -1,
    );
  }, [reduceMotion, rotation]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={{ width: ringSize, height: ringSize, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={[
          {
            width: ringSize * 1.4,
            height: ringSize * 1.4,
            position: 'absolute',
          },
          ringStyle,
        ]}
      >
        <LinearGradient
          colors={[colors.holoA, colors.holoB, colors.accent, colors.gradientEnd, colors.holoA]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <View
        style={{
          width: ringSize,
          height: ringSize,
          borderRadius: ringSize / 2,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            ...StyleSheet.absoluteFill,
            borderRadius: ringSize / 2,
            borderWidth,
            borderColor: 'transparent',
            overflow: 'hidden',
          }}
        >
          <Animated.View style={[StyleSheet.absoluteFill, ringStyle]}>
            <LinearGradient
              colors={[colors.holoA, colors.holoB, colors.accent, colors.gradientEnd, colors.holoA]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{ width: ringSize * 2, height: ringSize * 2 }}
            />
          </Animated.View>
        </View>
        <View
          style={{
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            backgroundColor: colors.voidAlt,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Check size={checkSize} color={colors.accent} strokeWidth={3} />
        </View>
      </View>
    </View>
  );
}
