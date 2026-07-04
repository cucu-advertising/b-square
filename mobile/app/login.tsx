import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { Screen } from '@/components/Screen';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Eyebrow } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { Fonts } from '@/lib/typography';

export default function Login() {
  const { colors } = useTheme();
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [focused, setFocused] = useState(false);

  const valid = phone.replace(/\D/g, '').length >= 10;

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.body}>
          <Eyebrow>Step 01</Eyebrow>
          <Text style={[styles.headline, { color: colors.text }]}>
            Let’s verify you’re a real business.
          </Text>
          <Text style={[styles.subtext, { color: colors.textDim }]}>
            We send a one-time code to your phone. Every member on B Square is a
            verified, GSTIN-checked business owner — no bots, no noise.
          </Text>

          <Text style={[styles.label, { color: colors.textFaint }]}>PHONE NUMBER</Text>
          <View
            style={[
              styles.inputWrap,
              {
                backgroundColor: colors.glass,
                borderColor: focused ? colors.gradientStart : colors.glassBorder,
                shadowColor: colors.glowSoft,
                shadowOpacity: focused ? 1 : 0,
                shadowRadius: focused ? 16 : 0,
              },
            ]}
          >
            <View style={[styles.prefix, { borderRightColor: colors.glassBorder }]}>
              <Text style={[styles.prefixText, { color: colors.text }]}>+91</Text>
            </View>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              keyboardType="phone-pad"
              placeholder="98765 43210"
              placeholderTextColor={colors.textFaint}
              maxLength={11}
              style={[styles.input, { color: colors.text }]}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <PrimaryButton
            label="Send code"
            onPress={() => router.push('/otp')}
            disabled={!valid}
            icon={<ArrowRight size={18} color="#FFFFFF" strokeWidth={2.5} />}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: { flex: 1, paddingHorizontal: 24, paddingTop: 40 },
  headline: { fontFamily: Fonts.displayBold, fontSize: 32, lineHeight: 38, marginTop: 16 },
  subtext: { fontFamily: Fonts.bodyRegular, fontSize: 15, lineHeight: 22, marginTop: 14 },
  label: { fontFamily: Fonts.monoMedium, fontSize: 11, letterSpacing: 1.4, marginTop: 40, marginBottom: 10 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  prefix: { paddingHorizontal: 16, paddingVertical: 16, borderRightWidth: 1 },
  prefixText: { fontFamily: Fonts.monoMedium, fontSize: 16 },
  input: { flex: 1, paddingHorizontal: 14, paddingVertical: 16, fontFamily: Fonts.bodyMedium, fontSize: 17, letterSpacing: 1 },
  footer: { paddingHorizontal: 24, paddingBottom: 16 },
});
