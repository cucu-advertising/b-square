import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight } from 'lucide-react-native';
import { Screen } from '@/components/Screen';
import { PrimaryButton } from '@/components/PrimaryButton';
import { PressableScale } from '@/components/PressableScale';
import { ConicGradientRing } from '@/components/ConicGradientRing';
import { Eyebrow } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { Fonts } from '@/lib/typography';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { initials } from '@/lib/mockData';
import type { ColorStop } from '@/lib/color';

const INDUSTRIES = ['Marketing', 'Real Estate', 'F&B', 'Fashion', 'D2C'];

export default function Onboarding() {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const router = useRouter();
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState<string | null>(null);

  const stops: ColorStop[] = useMemo(
    () => [
      { pos: 0, color: colors.holoA },
      { pos: 0.25, color: colors.holoB },
      { pos: 0.5, color: colors.accent },
      { pos: 0.75, color: colors.gradientEnd },
      { pos: 1, color: colors.holoA },
    ],
    [colors]
  );

  const ready = name.trim().length > 1 && !!industry;
  const avatarInitials = name.trim() ? initials(name) : 'B²';

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <View style={styles.dots}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  { backgroundColor: i < 2 ? colors.accent : colors.glassBorder, width: i < 2 ? 22 : 8 },
                ]}
              />
            ))}
          </View>

          <Eyebrow>Step 02 · Build your card</Eyebrow>
          <Text style={[styles.headline, { color: colors.text }]}>Build your card</Text>

          <View style={styles.avatarWrap}>
            <View style={styles.avatarRing}>
              <ConicGradientRing size={124} thickness={3} stops={stops} duration={6} spin={!reduced} />
            </View>
            <View style={[styles.avatarInner, { backgroundColor: colors.voidAlt }]}>
              <Text style={[styles.avatarText, { color: colors.text }]}>{avatarInitials}</Text>
            </View>
          </View>

          <Text style={[styles.label, { color: colors.textFaint }]}>BUSINESS NAME</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Cucu Advertising"
            placeholderTextColor={colors.textFaint}
            style={[
              styles.input,
              { color: colors.text, backgroundColor: colors.glass, borderColor: colors.glassBorder },
            ]}
          />

          <Text style={[styles.label, { color: colors.textFaint, marginTop: 26 }]}>INDUSTRY</Text>
          <View style={styles.chips}>
            {INDUSTRIES.map((item) => {
              const selected = industry === item;
              return (
                <PressableScale key={item} onPress={() => setIndustry(item)}>
                  {selected ? (
                    <LinearGradient
                      colors={[colors.gradientStart, colors.gradientEnd]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.chip}
                    >
                      <Text style={[styles.chipText, { color: '#FFFFFF' }]}>{item}</Text>
                    </LinearGradient>
                  ) : (
                    <View
                      style={[
                        styles.chip,
                        { backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorder },
                      ]}
                    >
                      <Text style={[styles.chipText, { color: colors.textDim }]}>{item}</Text>
                    </View>
                  )}
                </PressableScale>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            label="Enter B Square"
            onPress={() => router.replace('/(tabs)/nearby')}
            disabled={!ready}
            icon={<ArrowRight size={18} color="#FFFFFF" strokeWidth={2.5} />}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24 },
  dots: { flexDirection: 'row', gap: 6, marginBottom: 24 },
  dot: { height: 8, borderRadius: 4 },
  headline: { fontFamily: Fonts.displayBold, fontSize: 30, marginTop: 14 },
  avatarWrap: { alignSelf: 'center', marginVertical: 30, width: 124, height: 124, alignItems: 'center', justifyContent: 'center' },
  avatarRing: { position: 'absolute' },
  avatarInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: Fonts.displayBold, fontSize: 32 },
  label: { fontFamily: Fonts.monoMedium, fontSize: 11, letterSpacing: 1.4, marginBottom: 10 },
  input: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontFamily: Fonts.bodyMedium,
    fontSize: 16,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 999 },
  chipText: { fontFamily: Fonts.bodySemiBold, fontSize: 14 },
  footer: { paddingHorizontal: 24, paddingBottom: 16 },
});
