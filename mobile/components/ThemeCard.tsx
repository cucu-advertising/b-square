import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check } from 'lucide-react-native';
import { PressableScale } from './PressableScale';
import { GlassCard } from './GlassCard';
import { useTheme, type Theme } from '@/lib/theme';
import { Fonts } from '@/lib/typography';

type Props = { theme: Theme; active: boolean; onPress: () => void };

/** A selectable theme preview card in the Palette picker. */
export function ThemeCard({ theme, active, onPress }: Props) {
  const current = useTheme();
  const c = theme.colors;

  return (
    <PressableScale onPress={onPress} style={{ flex: 1 }}>
      <GlassCard
        padded={false}
        style={{
          borderColor: active ? current.colors.accent : current.colors.glassBorder,
          borderWidth: active ? 1.5 : StyleSheet.hairlineWidth,
        }}
      >
        <View style={styles.inner}>
          <LinearGradient
            colors={[c.gradientStart, c.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bar}
          />
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: current.colors.text }]}>{theme.label}</Text>
            {active && (
              <View style={[styles.checkDot, { backgroundColor: current.colors.accent }]}>
                <Check size={12} color={current.colors.onAccent} strokeWidth={3} />
              </View>
            )}
          </View>
          <Text style={[styles.tag, { color: current.colors.textDim }]}>{theme.tag}</Text>
        </View>
      </GlassCard>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  inner: { padding: 14 },
  bar: { height: 44, borderRadius: 12 },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  label: { fontFamily: Fonts.displaySemiBold, fontSize: 15 },
  checkDot: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tag: { fontFamily: Fonts.monoRegular, fontSize: 10.5, marginTop: 4, letterSpacing: 0.3 },
});
