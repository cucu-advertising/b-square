import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HoloAvatar } from '../components/HoloAvatar';
import { PrimaryButton } from '../components/PrimaryButton';
import { fonts } from '../lib/fonts';
import { INDUSTRIES } from '../lib/mockData';
import { useAppStore } from '../lib/store';
import { useTheme } from '../lib/theme';

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function OnboardingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const businessName = useAppStore((s) => s.businessName);
  const setBusinessName = useAppStore((s) => s.setBusinessName);
  const industry = useAppStore((s) => s.industry);
  const setIndustry = useAppStore((s) => s.setIndustry);

  const canSubmit = businessName.trim().length > 1 && !!industry;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.void }]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.dotsRow}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i <= 1 ? theme.colors.accent : theme.colors.glassBorder,
                  width: i <= 1 ? 22 : 8,
                },
              ]}
            />
          ))}
        </View>

        <Text style={[styles.headline, { color: theme.colors.text }]}>Build your card</Text>
        <Text style={[styles.subtext, { color: theme.colors.textDim }]}>
          This is what other verified businesses see when they find you nearby.
        </Text>

        <View style={styles.avatarWrap}>
          <HoloAvatar size={104} initials={initialsFor(businessName)} />
        </View>

        <Text style={[styles.inputLabel, { color: theme.colors.textFaint }]}>BUSINESS NAME</Text>
        <View
          style={[
            styles.inputRow,
            { backgroundColor: theme.colors.glass, borderColor: theme.colors.glassBorder },
          ]}
        >
          <TextInput
            value={businessName}
            onChangeText={setBusinessName}
            placeholder="e.g. Reddy Interiors"
            placeholderTextColor={theme.colors.textFaint}
            style={[styles.input, { color: theme.colors.text }]}
          />
        </View>

        <Text style={[styles.inputLabel, { color: theme.colors.textFaint, marginTop: 24 }]}>
          INDUSTRY
        </Text>
        <View style={styles.chipsWrap}>
          {INDUSTRIES.map((item) => {
            const selected = industry === item;
            return (
              <Pressable key={item} onPress={() => setIndustry(item)}>
                {selected ? (
                  <View
                    style={[
                      styles.chip,
                      styles.chipSelected,
                      { backgroundColor: theme.colors.gradientStart },
                    ]}
                  >
                    <Text style={[styles.chipTextSelected, { color: theme.colors.onAccent }]}>
                      {item}
                    </Text>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.chip,
                      { backgroundColor: theme.colors.glass, borderColor: theme.colors.glassBorder },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: theme.colors.textDim }]}>{item}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label="Enter B Square"
          disabled={!canSubmit}
          onPress={() => router.replace('/(tabs)/nearby')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  headline: {
    fontFamily: fonts.display700,
    fontSize: 28,
    marginBottom: 8,
  },
  subtext: {
    fontFamily: fonts.body400,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 28,
  },
  avatarWrap: {
    alignItems: 'center',
    marginBottom: 32,
  },
  inputLabel: {
    fontFamily: fonts.mono500,
    fontSize: 11,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  inputRow: {
    height: 58,
    borderRadius: 16,
    borderWidth: 1.5,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  input: {
    fontFamily: fonts.body500,
    fontSize: 16,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    borderWidth: 1.5,
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chipSelected: {
    borderWidth: 0,
  },
  chipText: {
    fontFamily: fonts.body500,
    fontSize: 14,
  },
  chipTextSelected: {
    fontFamily: fonts.body600,
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    paddingTop: 8,
  },
});
