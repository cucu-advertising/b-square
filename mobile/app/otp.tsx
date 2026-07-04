import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import Animated, {
  Easing,
  cancelAnimation,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Screen } from '@/components/Screen';
import { PrimaryButton } from '@/components/PrimaryButton';
import { PressableScale } from '@/components/PressableScale';
import { Eyebrow } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { Fonts } from '@/lib/typography';
import { useReducedMotion } from '@/lib/useReducedMotion';

const LENGTH = 4;

function OtpBox({ digit, active, filled }: { digit: string; active: boolean; filled: boolean }) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const blink = useSharedValue(0);

  useEffect(() => {
    if (active && !reduced) {
      blink.value = withRepeat(withTiming(1, { duration: 650, easing: Easing.inOut(Easing.ease) }), -1, true);
    } else {
      cancelAnimation(blink);
      blink.value = active ? 1 : 0;
    }
    return () => cancelAnimation(blink);
  }, [active, reduced, blink]);

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: active
      ? interpolateColor(blink.value, [0, 1], [colors.glassBorder, colors.accent])
      : filled
        ? colors.glassBorder
        : colors.glassBorder,
  }));

  return (
    <Animated.View
      style={[
        styles.box,
        {
          backgroundColor: colors.glass,
          shadowColor: colors.glowSoft,
          shadowOpacity: filled ? 1 : 0,
          shadowRadius: filled ? 14 : 0,
        },
        animatedStyle,
      ]}
    >
      <Text style={[styles.boxText, { color: colors.text }]}>{digit}</Text>
    </Animated.View>
  );
}

export default function Otp() {
  const { colors } = useTheme();
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const [code, setCode] = useState('');

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 350);
    return () => clearTimeout(t);
  }, []);

  const digits = Array.from({ length: LENGTH }, (_, i) => code[i] ?? '');

  return (
    <Screen>
      <View style={styles.body}>
        <Eyebrow>Step 01 · Verify</Eyebrow>
        <Text style={[styles.headline, { color: colors.text }]}>Enter your code</Text>
        <Text style={[styles.subtext, { color: colors.textDim }]}>
          We sent a 4-digit code to your phone. Enter it below to continue.
        </Text>

        <Pressable style={styles.boxes} onPress={() => inputRef.current?.focus()}>
          {digits.map((d, i) => (
            <OtpBox key={i} digit={d} filled={!!d} active={i === code.length} />
          ))}
        </Pressable>

        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, LENGTH))}
          keyboardType="number-pad"
          maxLength={LENGTH}
          style={styles.hiddenInput}
          caretHidden
        />

        <View style={styles.resendRow}>
          <Text style={[styles.resendText, { color: colors.textDim }]}>Didn’t get it? </Text>
          <PressableScale onPress={() => setCode('')} hitSlop={8}>
            <Text style={[styles.resendLink, { color: colors.holoA }]}>Resend</Text>
          </PressableScale>
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label="Verify & continue"
          onPress={() => router.push('/onboarding')}
          disabled={code.length < LENGTH}
          icon={<ArrowRight size={18} color="#FFFFFF" strokeWidth={2.5} />}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: 24, paddingTop: 40 },
  headline: { fontFamily: Fonts.displayBold, fontSize: 32, marginTop: 16 },
  subtext: { fontFamily: Fonts.bodyRegular, fontSize: 15, lineHeight: 22, marginTop: 14 },
  boxes: { flexDirection: 'row', gap: 14, marginTop: 40 },
  box: {
    width: 64,
    height: 72,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
  },
  boxText: { fontFamily: Fonts.displaySemiBold, fontSize: 30 },
  hiddenInput: { position: 'absolute', opacity: 0, height: 1, width: 1 },
  resendRow: { flexDirection: 'row', alignItems: 'center', marginTop: 28 },
  resendText: { fontFamily: Fonts.bodyRegular, fontSize: 14 },
  resendLink: { fontFamily: Fonts.bodySemiBold, fontSize: 14 },
  footer: { paddingHorizontal: 24, paddingBottom: 16 },
});
