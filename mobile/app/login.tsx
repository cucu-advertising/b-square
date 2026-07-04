import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eyebrow } from '../components/Eyebrow';
import { PrimaryButton } from '../components/PrimaryButton';
import { fonts } from '../lib/fonts';
import { useAppStore } from '../lib/store';
import { useTheme } from '../lib/theme';

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const setPhone = useAppStore((s) => s.setPhone);
  const phone = useAppStore((s) => s.phone);
  const [focused, setFocused] = useState(false);
  const focusAnim = useSharedValue(0);

  const onFocus = () => {
    setFocused(true);
    focusAnim.value = withTiming(1, { duration: 200 });
  };
  const onBlur = () => {
    setFocused(false);
    focusAnim.value = withTiming(0, { duration: 200 });
  };

  const inputContainerStyle = useAnimatedStyle(() => ({
    borderColor: focused ? theme.colors.gradientStart : theme.colors.glassBorder,
    shadowOpacity: focusAnim.value * 0.9,
  }));

  const canSubmit = phone.length >= 10;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.void }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.top}>
          <Eyebrow>Step 01</Eyebrow>
          <Text style={[styles.headline, { color: theme.colors.text }]}>
            Let's verify you're a real business.
          </Text>
          <Text style={[styles.subtext, { color: theme.colors.textDim }]}>
            We use your phone number to confirm you're a real, reachable business owner —
            not a bot or a burner account. Takes less than a minute.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={[styles.inputLabel, { color: theme.colors.textFaint }]}>PHONE NUMBER</Text>
          <Animated.View
            style={[
              styles.inputRow,
              inputContainerStyle,
              {
                backgroundColor: theme.colors.glass,
                shadowColor: theme.colors.glowSoft,
              },
            ]}
          >
            <Text style={[styles.prefix, { color: theme.colors.textDim }]}>+91</Text>
            <View style={[styles.divider, { backgroundColor: theme.colors.glassBorder }]} />
            <TextInput
              value={phone}
              onChangeText={setPhone}
              onFocus={onFocus}
              onBlur={onBlur}
              placeholder="98765 43210"
              placeholderTextColor={theme.colors.textFaint}
              keyboardType="phone-pad"
              maxLength={10}
              style={[styles.input, { color: theme.colors.text }]}
            />
          </Animated.View>

          <PrimaryButton
            label="Send code"
            disabled={!canSubmit}
            onPress={() => router.push('/otp')}
            style={styles.button}
          />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  top: {
    marginTop: 24,
    gap: 14,
  },
  headline: {
    fontFamily: fonts.display700,
    fontSize: 30,
    lineHeight: 38,
  },
  subtext: {
    fontFamily: fonts.body400,
    fontSize: 15,
    lineHeight: 22,
  },
  form: {
    marginBottom: 24,
    gap: 12,
  },
  inputLabel: {
    fontFamily: fonts.mono500,
    fontSize: 11,
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    borderRadius: 18,
    borderWidth: 1.5,
    paddingHorizontal: 18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  prefix: {
    fontFamily: fonts.mono500,
    fontSize: 16,
  },
  divider: {
    width: 1,
    height: 22,
    marginHorizontal: 14,
  },
  input: {
    flex: 1,
    fontFamily: fonts.body500,
    fontSize: 17,
    letterSpacing: 1,
  },
  button: {
    marginTop: 8,
  },
});
