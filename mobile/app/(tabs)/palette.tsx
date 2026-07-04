import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eyebrow } from '../../components/Eyebrow';
import { ThemeCard } from '../../components/ThemeCard';
import { VerifiedSeal } from '../../components/VerifiedSeal';
import { useFocusPointerEvents } from '../../hooks/useFocusPointerEvents';
import { fonts } from '../../lib/fonts';
import { THEMES, useThemeStore } from '../../lib/theme';

function Swatch({ label, children }: { label: string; children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme);
  return (
    <View style={styles.swatch}>
      <View style={styles.swatchPreview}>{children}</View>
      <Text style={[styles.swatchLabel, { color: theme.colors.textDim }]}>{label}</Text>
    </View>
  );
}

export default function PaletteScreen() {
  const theme = useThemeStore((s) => s.theme);
  const themeKey = useThemeStore((s) => s.themeKey);
  const setTheme = useThemeStore((s) => s.setTheme);
  const pointerEvents = useFocusPointerEvents();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.void, pointerEvents }]}
      edges={['top']}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Palette</Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textDim }]}>
          Pick a theme — it applies live, everywhere.
        </Text>

        {/*
          DEV-ONLY SCREEN: kept in the shipped tab bar so stakeholders can flip
          themes live during demos. Remove or move behind a hidden dev menu
          before a real release.
        */}

        <View style={styles.grid}>
          {THEMES.map((t) => (
            <ThemeCard key={t.key} themeOption={t} active={t.key === themeKey} onPress={() => setTheme(t.key)} />
          ))}
        </View>

        <View style={styles.panelHeader}>
          <Eyebrow>Live swatches</Eyebrow>
        </View>

        <View style={[styles.panel, { backgroundColor: theme.colors.glass, borderColor: theme.colors.glassBorder }]}>
          <View style={styles.swatchRow}>
            <Swatch label="Void">
              <View style={[styles.swatchBox, { backgroundColor: theme.colors.void, borderColor: theme.colors.glassBorder, borderWidth: 1 }]} />
            </Swatch>
            <Swatch label="Primary gradient">
              <LinearGradient
                colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.swatchBox}
              />
            </Swatch>
            <Swatch label="Accent">
              <View style={[styles.swatchBox, { backgroundColor: theme.colors.accent }]} />
            </Swatch>
          </View>
          <View style={styles.swatchRow}>
            <Swatch label="Coral">
              <View style={[styles.swatchBox, { backgroundColor: theme.colors.coral }]} />
            </Swatch>
            <Swatch label="Seal">
              <View style={[styles.swatchBox, styles.sealBox]}>
                <VerifiedSeal size={36} />
              </View>
            </Swatch>
            <Swatch label="Glass surface">
              <View
                style={[
                  styles.swatchBox,
                  { backgroundColor: theme.colors.glass, borderColor: theme.colors.glassBorder, borderWidth: 1 },
                ]}
              />
            </Swatch>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  headerTitle: {
    fontFamily: fonts.display700,
    fontSize: 26,
    marginTop: 8,
  },
  headerSubtitle: {
    fontFamily: fonts.body400,
    fontSize: 14,
    marginTop: 4,
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  panelHeader: {
    marginTop: 28,
    marginBottom: 12,
  },
  panel: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    gap: 18,
  },
  swatchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  swatch: {
    alignItems: 'center',
    gap: 8,
    width: '30%',
  },
  swatchPreview: {
    width: '100%',
    height: 44,
  },
  swatchBox: {
    flex: 1,
    borderRadius: 12,
  },
  sealBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchLabel: {
    fontFamily: fonts.mono400,
    fontSize: 9,
    letterSpacing: 0.4,
    textAlign: 'center',
  },
});
