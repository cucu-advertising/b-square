import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { usePressScale } from '../hooks/usePressScale';
import { fonts } from '../lib/fonts';
import { useTheme } from '../lib/theme';

type Props = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Use solid accent fill instead of the primary gradient (e.g. Connect / Accept). */
  variant?: 'gradient' | 'accent';
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  icon,
  style,
  variant = 'gradient',
}: Props) {
  const theme = useTheme();
  const { style: pressStyle, onPressIn, onPressOut } = usePressScale(0.97);

  const content = (
    <View style={styles.contentRow}>
      {loading ? (
        <ActivityIndicator color={theme.colors.onAccent} />
      ) : (
        <>
          {icon}
          <Text style={[styles.label, { color: theme.colors.onAccent }]}>{label}</Text>
        </>
      )}
    </View>
  );

  return (
    <AnimatedPressable
      onPress={disabled || loading ? undefined : onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      style={[pressStyle, { opacity: disabled ? 0.5 : 1 }, style]}
    >
      {variant === 'gradient' ? (
        <LinearGradient
          colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          {content}
        </LinearGradient>
      ) : (
        <View style={[styles.button, { backgroundColor: theme.colors.accent }]}>{content}</View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontFamily: fonts.body600,
    fontSize: 16,
  },
});
