import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Check } from 'lucide-react-native';
import { ConicGradientRing } from './ConicGradientRing';
import type { ColorStop } from '@/lib/color';
import { useTheme } from '@/lib/theme';
import { useReducedMotion } from '@/lib/useReducedMotion';

type Props = {
  size?: number;
  /** Seconds per revolution (default 5.5s). */
  duration?: number;
};

/**
 * The signature element: a small circular seal on every verified profile.
 * Outer ring is a slowly rotating conic gradient; inner circle is solid
 * voidAlt with an accent checkmark.
 */
export function VerifiedSeal({ size = 26, duration = 5.5 }: Props) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const c = theme.colors;

  const thickness = Math.max(2.5, size * 0.13);

  const stops: ColorStop[] = useMemo(
    () => [
      { pos: 0, color: c.holoA },
      { pos: 0.25, color: c.holoB },
      { pos: 0.5, color: c.accent },
      { pos: 0.75, color: c.gradientEnd },
      { pos: 1, color: c.holoA },
    ],
    [c.holoA, c.holoB, c.accent, c.gradientEnd]
  );

  const inner = size - thickness * 2;
  const iconSize = Math.max(9, inner * 0.62);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <ConicGradientRing
        size={size}
        thickness={thickness}
        stops={stops}
        duration={duration}
        spin={!reduced}
      />
      <View
        style={{
          position: 'absolute',
          width: inner,
          height: inner,
          borderRadius: inner / 2,
          backgroundColor: c.voidAlt,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Check size={iconSize} color={c.accent} strokeWidth={3} />
      </View>
    </View>
  );
}
