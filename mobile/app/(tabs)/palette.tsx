import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeCard } from '../../components/ThemeCard';
import { useThemeColors, THEMES, useThemeStore } from '../../lib/theme';

export default function PaletteScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const activeThemeKey = useThemeStore((s) => s.activeThemeKey);
  const setTheme = useThemeStore((s) => s.setTheme);

  const swatches = [
    { label: 'Void', color: colors.void },
    { label: 'Primary Gradient', color: colors.gradientStart, secondary: colors.gradientEnd },
    { label: 'Accent', color: colors.accent },
    { label: 'Coral', color: colors.coral },
    { label: 'Seal', color: colors.holoA, secondary: colors.holoB },
    { label: 'Glass Surface', color: colors.glass, border: colors.glassBorder },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.void }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>Palette</Text>
      <Text style={[styles.subtitle, { color: colors.textDim }]}>
        Switch themes live — every screen updates instantly.
      </Text>

      <View style={styles.grid}>
        {THEMES.map((theme) => (
          <ThemeCard
            key={theme.key}
            label={theme.label}
            tag={theme.tag}
            gradientStart={theme.colors.gradientStart}
            gradientEnd={theme.colors.gradientEnd}
            selected={activeThemeKey === theme.key}
            onPress={() => setTheme(theme.key)}
          />
        ))}
      </View>

      <Text style={[styles.swatchTitle, { color: colors.textFaint }]}>LIVE SWATCHES</Text>
      <View
        style={[
          styles.swatchPanel,
          {
            backgroundColor: colors.glass,
            borderColor: colors.glassBorder,
          },
        ]}
      >
        {swatches.map((swatch) => (
          <View key={swatch.label} style={styles.swatchRow}>
            <View style={styles.swatchColors}>
              <View
                style={[
                  styles.swatch,
                  {
                    backgroundColor: swatch.color,
                    borderColor: swatch.border ?? colors.glassBorder,
                    borderWidth: swatch.border ? 1 : 0,
                  },
                ]}
              />
              {swatch.secondary && (
                <View style={[styles.swatch, { backgroundColor: swatch.secondary }]} />
              )}
            </View>
            <Text style={[styles.swatchLabel, { color: colors.textDim }]}>{swatch.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    gap: 16,
  },
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    marginTop: -8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  swatchTitle: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
    letterSpacing: 1.6,
    marginTop: 12,
  },
  swatchPanel: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  swatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  swatchColors: {
    flexDirection: 'row',
    gap: 6,
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
  swatchLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
});
