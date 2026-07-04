import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/lib/theme';
import { Fonts, eyebrow } from '@/lib/typography';
import { initials } from '@/lib/mockData';

/** Uppercase mono eyebrow label (STEP 01, NEARBY · VERIFIED, etc). */
export function Eyebrow({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  const { colors } = useTheme();
  return <Text style={[eyebrow, { color: colors.accent }, style]}>{children}</Text>;
}

/** Small mono pill used for tags, distances and status labels. */
export function Pill({
  children,
  tone = 'glass',
  style,
}: {
  children: React.ReactNode;
  tone?: 'glass' | 'accent';
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const accentTint = tone === 'accent';
  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: accentTint ? colors.glowSoft : colors.glass,
          borderColor: accentTint ? colors.accent : colors.glassBorder,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.pillText,
          { color: accentTint ? colors.accent : colors.textDim },
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

/** Avatar initial circle. Uses the hero gradient for a premium feel. */
export function Avatar({ name, size = 46 }: { name: string; size?: number }) {
  const { colors } = useTheme();
  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontFamily: Fonts.displaySemiBold, color: '#FFFFFF', fontSize: size * 0.34 }}>
        {initials(name)}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  pillText: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10.5,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
