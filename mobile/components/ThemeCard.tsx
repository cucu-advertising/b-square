import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScalePressable } from './AnimatedUI';
import { useThemeColors } from '../lib/theme';

type ThemeCardProps = {
  label: string;
  tag: string;
  gradientStart: string;
  gradientEnd: string;
  selected: boolean;
  onPress: () => void;
};

export function ThemeCard({
  label,
  tag,
  gradientStart,
  gradientEnd,
  selected,
  onPress,
}: ThemeCardProps) {
  const colors = useThemeColors();

  return (
    <ScalePressable
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.glass,
          borderColor: selected ? colors.accent : colors.glassBorder,
        },
      ]}
    >
      <LinearGradient
        colors={[gradientStart, gradientEnd]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.preview}
      />
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <Text style={[styles.tag, { color: colors.textDim }]}>{tag}</Text>
    </ScalePressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
    gap: 8,
    minWidth: '46%',
  },
  preview: {
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 16,
  },
  tag: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
});
