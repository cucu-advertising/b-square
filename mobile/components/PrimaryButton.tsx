import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PressableScale } from './PressableScale';
import { useTheme } from '@/lib/theme';
import { Fonts } from '@/lib/typography';

type Props = {
  label: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  /** 'gradient' = primary gradient fill; 'accent' = solid accent fill. */
  variant?: 'gradient' | 'accent';
  icon?: React.ReactNode;
  disabled?: boolean;
};

/** Primary CTA. Gradient variant for hero actions, accent variant for Connect. */
export function PrimaryButton({
  label,
  onPress,
  style,
  variant = 'gradient',
  icon,
  disabled,
}: Props) {
  const { colors } = useTheme();

  const content = (
    <View style={styles.row}>
      {icon}
      <Text
        style={[
          styles.label,
          { color: variant === 'accent' ? colors.onAccent : '#FFFFFF' },
        ]}
      >
        {label}
      </Text>
    </View>
  );

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={[
        styles.wrapper,
        {
          shadowColor: colors.glow,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {variant === 'accent' ? (
        <View style={[styles.inner, { backgroundColor: colors.accent }]}>{content}</View>
      ) : (
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.inner}
        >
          {content}
        </LinearGradient>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.9,
    shadowRadius: 18,
    elevation: 6,
  },
  inner: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontFamily: Fonts.bodySemiBold, fontSize: 15.5, letterSpacing: 0.2 },
});
