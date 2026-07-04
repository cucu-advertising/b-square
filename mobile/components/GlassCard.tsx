import { BlurView } from 'expo-blur';
import React from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../lib/theme';

type Props = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  radius?: number;
};

/**
 * Reusable translucent card wrapper — a frosted glass surface with a hairline
 * border, matching the app's glass-surfaced design language.
 */
export function GlassCard({ children, style, intensity = 24, radius = 20 }: Props) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.wrapper,
        {
          borderRadius: radius,
          borderColor: theme.colors.glassBorder,
          backgroundColor: Platform.OS === 'android' ? theme.colors.glass : 'transparent',
        },
        style,
      ]}
    >
      {Platform.OS !== 'android' && (
        <BlurView
          intensity={intensity}
          tint={theme.key === 'arctic' ? 'light' : 'dark'}
          style={StyleSheet.absoluteFill}
        />
      )}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.glass }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    overflow: 'hidden',
  },
});
