import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/components/Screen';
import { GlassCard } from '@/components/GlassCard';
import { ThemeCard } from '@/components/ThemeCard';
import { VerifiedSeal } from '@/components/VerifiedSeal';
import { Eyebrow } from '@/components/ui';
import { THEMES, useTheme, useThemeStore } from '@/lib/theme';
import { Fonts } from '@/lib/typography';

export default function Palette() {
  const theme = useTheme();
  const c = theme.colors;
  const activeKey = useThemeStore((s) => s.activeKey);
  const setTheme = useThemeStore((s) => s.setTheme);

  // Pair up themes into rows of 2 for the grid.
  const rows: (typeof THEMES)[] = [];
  for (let i = 0; i < THEMES.length; i += 2) rows.push(THEMES.slice(i, i + 2));

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[styles.title, { color: c.text }]}>Palette</Text>
        <Eyebrow>Live theme · dev tool</Eyebrow>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {rows.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((t) => (
              <ThemeCard
                key={t.key}
                theme={t}
                active={t.key === activeKey}
                onPress={() => setTheme(t.key)}
              />
            ))}
            {row.length === 1 && <View style={{ flex: 1 }} />}
          </View>
        ))}

        <Text style={[styles.swatchTitle, { color: c.textFaint }]}>LIVE SWATCHES</Text>
        <GlassCard>
          <Swatch label="Void" color={c.void} />
          <Divider />
          <SwatchGradient label="Primary Gradient" start={c.gradientStart} end={c.gradientEnd} />
          <Divider />
          <Swatch label="Accent" color={c.accent} />
          <Divider />
          <Swatch label="Coral" color={c.coral} />
          <Divider />
          <View style={styles.swatchRow}>
            <Text style={[styles.swatchLabel, { color: c.text }]}>Seal</Text>
            <VerifiedSeal size={28} />
          </View>
          <Divider />
          <Swatch label="Glass Surface" color={c.glass} bordered />
        </GlassCard>
      </ScrollView>
    </Screen>
  );

  function Divider() {
    return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: c.glassBorder }} />;
  }

  function Swatch({ label, color, bordered }: { label: string; color: string; bordered?: boolean }) {
    return (
      <View style={styles.swatchRow}>
        <Text style={[styles.swatchLabel, { color: c.text }]}>{label}</Text>
        <View style={styles.swatchRight}>
          <Text style={[styles.swatchValue, { color: c.textDim }]}>{color}</Text>
          <View
            style={[
              styles.chip,
              { backgroundColor: color, borderColor: bordered ? c.glassBorder : color, borderWidth: 1 },
            ]}
          />
        </View>
      </View>
    );
  }

  function SwatchGradient({ label, start, end }: { label: string; start: string; end: string }) {
    return (
      <View style={styles.swatchRow}>
        <Text style={[styles.swatchLabel, { color: c.text }]}>{label}</Text>
        <LinearGradient colors={[start, end]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.chip} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  title: { fontFamily: Fonts.displayBold, fontSize: 28 },
  body: { paddingHorizontal: 20, paddingBottom: 40 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  swatchTitle: { fontFamily: Fonts.monoMedium, fontSize: 11, letterSpacing: 1.4, marginTop: 20, marginBottom: 12 },
  swatchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 13 },
  swatchLabel: { fontFamily: Fonts.bodyMedium, fontSize: 15 },
  swatchRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  swatchValue: { fontFamily: Fonts.monoRegular, fontSize: 11.5 },
  chip: { width: 44, height: 28, borderRadius: 8 },
});
