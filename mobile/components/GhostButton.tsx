import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { usePressScale } from '../hooks/usePressScale';
import { fonts } from '../lib/fonts';
import { useTheme } from '../lib/theme';

type Props = {
  label: string;
  onPress?: () => void;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function GhostButton({ label, onPress, icon, style }: Props) {
  const theme = useTheme();
  const { style: pressStyle, onPressIn, onPressOut } = usePressScale(0.97);

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[pressStyle, style]}
    >
      <View
        style={[
          styles.button,
          { backgroundColor: theme.colors.glass, borderColor: theme.colors.glassBorder },
        ]}
      >
        {icon}
        <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  label: {
    fontFamily: fonts.body600,
    fontSize: 16,
  },
});
