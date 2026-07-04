import { StyleSheet, Text } from 'react-native';
import { ScalePressable } from './AnimatedUI';
import { useThemeColors } from '../lib/theme';

type GhostButtonProps = {
  label: string;
  onPress?: () => void;
  fullWidth?: boolean;
};

export function GhostButton({ label, onPress, fullWidth = false }: GhostButtonProps) {
  const colors = useThemeColors();

  return (
    <ScalePressable
      onPress={onPress}
      style={[
        styles.button,
        fullWidth && styles.fullWidth,
        {
          borderColor: colors.glassBorder,
          backgroundColor: colors.glass,
        },
      ]}
    >
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </ScalePressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    flex: 1,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
});
