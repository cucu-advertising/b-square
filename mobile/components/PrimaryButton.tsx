import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScalePressable } from './AnimatedUI';
import { useThemeColors } from '../lib/theme';

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
};

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  fullWidth = true,
}: PrimaryButtonProps) {
  const colors = useThemeColors();

  return (
    <ScalePressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.wrapper, fullWidth && styles.fullWidth, disabled && styles.disabled]}
    >
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      </LinearGradient>
    </ScalePressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
});
