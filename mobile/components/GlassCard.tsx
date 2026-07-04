import { StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, useThemeColors } from '../lib/theme';

type GlassCardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
};

export function GlassCard({ children, style, intensity = 24 }: GlassCardProps) {
  const colors = useThemeColors();
  const theme = useTheme();
  const blurTint = theme.key === 'arctic' ? 'light' : 'dark';

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: colors.glass,
          borderColor: colors.glassBorder,
        },
        style,
      ]}
    >
      <BlurView intensity={intensity} tint={blurTint} style={StyleSheet.absoluteFill} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
});
