import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/lib/theme';

type Props = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  radius?: number;
  padded?: boolean;
};

/** Reusable translucent frosted-glass surface (BlurView + glass fill + border). */
export function GlassCard({ children, style, intensity = 24, radius = 22, padded = true }: Props) {
  const { colors } = useTheme();
  // Light themes (e.g. Arctic) read better with a light blur tint.
  const isLight = colors.void.toLowerCase() === '#f5f7fb';

  return (
    <View
      style={[
        {
          borderRadius: radius,
          overflow: 'hidden',
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.glassBorder,
          backgroundColor: colors.surface,
        },
        style,
      ]}
    >
      <BlurView
        intensity={intensity}
        tint={isLight ? 'light' : 'dark'}
        style={StyleSheet.absoluteFill}
      />
      <View style={{ backgroundColor: colors.glass }}>
        <View style={padded ? styles.padded : undefined}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  padded: { padding: 16 },
});
