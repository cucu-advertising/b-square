import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { sampleGradient, type ColorStop } from '@/lib/color';

type Props = {
  size: number;
  /** Ring thickness in px. */
  thickness: number;
  stops: ColorStop[];
  /** Seconds per full revolution. */
  duration?: number;
  /** When false, the ring holds still (reduced-motion). */
  spin?: boolean;
  segments?: number;
};

/**
 * Approximates a rotating conic gradient by drawing many angular wedge
 * segments with SVG and interpolating color across the supplied stops.
 */
export function ConicGradientRing({
  size,
  thickness,
  stops,
  duration = 5.5,
  spin = true,
  segments = 72,
}: Props) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (spin) {
      rotation.value = 0;
      rotation.value = withRepeat(
        withTiming(360, { duration: duration * 1000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      cancelAnimation(rotation);
      rotation.value = 0;
    }
    return () => cancelAnimation(rotation);
  }, [spin, duration, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const wedges = useMemo(() => {
    const cx = size / 2;
    const cy = size / 2;
    const r = (size - thickness) / 2; // stroke centre-line keeps the ring in bounds
    const step = (Math.PI * 2) / segments;
    const paths: { d: string; color: string }[] = [];
    for (let i = 0; i < segments; i++) {
      const a0 = i * step - Math.PI / 2;
      const a1 = (i + 1) * step - Math.PI / 2 + 0.012; // slight overlap to avoid seams
      const x0 = cx + r * Math.cos(a0);
      const y0 = cy + r * Math.sin(a0);
      const x1 = cx + r * Math.cos(a1);
      const y1 = cy + r * Math.sin(a1);
      const d = `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`;
      paths.push({ d, color: sampleGradient(stops, i / segments) });
    }
    return paths;
  }, [size, thickness, segments, stops]);

  return (
    <View style={{ width: size, height: size }} pointerEvents="none">
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <Svg width={size} height={size}>
          {wedges.map((w, i) => (
            <Path
              key={i}
              d={w.d}
              stroke={w.color}
              strokeWidth={thickness}
              strokeLinecap="butt"
              fill="none"
            />
          ))}
        </Svg>
      </Animated.View>
    </View>
  );
}
