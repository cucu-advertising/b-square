import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eyebrow } from '../components/Eyebrow';
import { PrimaryButton } from '../components/PrimaryButton';
import { fonts } from '../lib/fonts';
import { useAppStore } from '../lib/store';
import { useTheme } from '../lib/theme';

const BOX_COUNT = 4;

function OtpBox({ index, value, active }: { index: number; value: string; active: boolean }) {
  const theme = useTheme();
  const blink = useSharedValue(1);

  useEffect(() => {
    if (active && !value) {
      blink.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      blink.value = 1;
    }
  }, [active, value, blink]);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: active && !value ? theme.colors.accent : undefined,
    opacity: active && !value ? blink.value : 1,
  }));

  const filled = value.length > 0;

  return (
    <View style={styles.boxOuter}>
      <Animated.View
        style={[
          styles.box,
          {
            backgroundColor: theme.colors.glass,
            borderColor: filled ? theme.colors.accent : theme.colors.glassBorder,
            shadowColor: theme.colors.glowSoft,
            shadowOpacity: filled ? 1 : 0,
          },
          active ? borderStyle : null,
        ]}
      >
        <Text style={[styles.boxText, { color: theme.colors.text }]}>{value}</Text>
      </Animated.View>
    </View>
  );
}

export default function OtpScreen() {
  const theme = useTheme();
  const router = useRouter();
  const otp = useAppStore((s) => s.otp);
  const setOtp = useAppStore((s) => s.setOtp);
  const phone = useAppStore((s) => s.phone);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<TextInput>(null);

  const digits = otp.join('');

  const onChangeDigits = (text: string) => {
    const clean = text.replace(/[^0-9]/g, '').slice(0, BOX_COUNT);
    const next = Array.from({ length: BOX_COUNT }, (_, i) => clean[i] ?? '');
    setOtp(next);
    setActiveIndex(Math.min(clean.length, BOX_COUNT - 1));
  };

  const canSubmit = digits.length === BOX_COUNT;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.void }]} edges={['top', 'bottom']}>
      <View style={styles.top}>
        <Eyebrow>Step 02</Eyebrow>
        <Text style={[styles.headline, { color: theme.colors.text }]}>Enter the code</Text>
        <Text style={[styles.subtext, { color: theme.colors.textDim }]}>
          We sent a 4-digit code to +91 {phone || '98765 43210'}
        </Text>
      </View>

      <Pressable onPress={() => inputRef.current?.focus()} style={styles.boxesRow}>
        {Array.from({ length: BOX_COUNT }).map((_, i) => (
          <OtpBox key={i} index={i} value={otp[i] ?? ''} active={activeIndex === i} />
        ))}
      </Pressable>

      <TextInput
        ref={inputRef}
        value={digits}
        onChangeText={onChangeDigits}
        onFocus={() => setActiveIndex(Math.min(digits.length, BOX_COUNT - 1))}
        keyboardType="number-pad"
        maxLength={BOX_COUNT}
        style={styles.hiddenInput}
        autoFocus
      />

      <Pressable style={styles.resendWrap} onPress={() => {}}>
        <Text style={[styles.resend, { color: theme.colors.holoA }]}>Didn't get it? Resend</Text>
      </Pressable>

      <PrimaryButton
        label="Verify & continue"
        disabled={!canSubmit}
        onPress={() => router.push('/onboarding')}
        style={styles.button}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  top: {
    marginTop: 24,
    gap: 12,
    marginBottom: 40,
  },
  headline: {
    fontFamily: fonts.display700,
    fontSize: 28,
  },
  subtext: {
    fontFamily: fonts.body400,
    fontSize: 15,
    lineHeight: 22,
  },
  boxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
  },
  boxOuter: {
    flex: 1,
  },
  box: {
    height: 64,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  boxText: {
    fontFamily: fonts.display700,
    fontSize: 24,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 1,
    width: 1,
  },
  resendWrap: {
    marginTop: 22,
    alignItems: 'center',
  },
  resend: {
    fontFamily: fonts.body600,
    fontSize: 14,
  },
  button: {
    marginTop: 'auto',
    marginBottom: 12,
  },
});
