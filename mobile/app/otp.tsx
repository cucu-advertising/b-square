import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScalePressable } from '../components/AnimatedUI';
import { useThemeColors } from '../lib/theme';

const OTP_LENGTH = 4;

export default function OtpScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '']);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const blink = useSharedValue(1);

  useEffect(() => {
    blink.value = withRepeat(
      withSequence(withTiming(0.3, { duration: 500 }), withTiming(1, { duration: 500 })),
      -1,
    );
  }, [blink]);

  const handleChange = (value: string, index: number) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);

    if (digit && index < OTP_LENGTH - 1) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      setActiveIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const isComplete = otp.every((d) => d.length === 1);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.void, paddingTop: insets.top + 32 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <Text style={[styles.eyebrow, { color: colors.accent }]}>STEP 02</Text>
        <Text style={[styles.headline, { color: colors.text }]}>Enter verification code</Text>
        <Text style={[styles.subtext, { color: colors.textDim }]}>
          We sent a 4-digit code to your phone. Enter it below to continue.
        </Text>

        <View style={styles.otpRow}>
          {otp.map((digit, index) => (
            <OtpBox
              key={index}
              digit={digit}
              index={index}
              activeIndex={activeIndex}
              blink={blink}
              colors={colors}
              onPress={() => {
                setActiveIndex(index);
                inputRefs.current[index]?.focus();
              }}
              inputRef={(ref) => {
                inputRefs.current[index] = ref;
              }}
              onChange={(v) => handleChange(v, index)}
              onKeyPress={(k) => handleKeyPress(k, index)}
              onFocus={() => setActiveIndex(index)}
            />
          ))}
        </View>

        <ScalePressable onPress={() => {}}>
          <Text style={[styles.resend, { color: colors.holoA }]}>Resend code</Text>
        </ScalePressable>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <PrimaryButton
          label="Verify & continue"
          onPress={() => router.push('/onboarding')}
          disabled={!isComplete}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

type OtpBoxProps = {
  digit: string;
  index: number;
  activeIndex: number;
  blink: SharedValue<number>;
  colors: ReturnType<typeof useThemeColors>;
  onPress: () => void;
  inputRef: (ref: TextInput | null) => void;
  onChange: (value: string) => void;
  onKeyPress: (key: string) => void;
  onFocus: () => void;
};

function OtpBox({
  digit,
  index,
  activeIndex,
  blink,
  colors,
  onPress,
  inputRef,
  onChange,
  onKeyPress,
  onFocus,
}: OtpBoxProps) {
  const isActive = index === activeIndex;
  const isFilled = digit.length > 0;

  const animatedBorder = useAnimatedStyle(() => ({
    borderColor: isActive ? colors.accent : isFilled ? colors.glassBorder : colors.glassBorder,
    opacity: isActive ? blink.value : 1,
  }));

  return (
    <Pressable onPress={onPress}>
      <Animated.View
        style={[
          styles.otpBox,
          {
            backgroundColor: colors.glass,
            shadowColor: isFilled ? colors.glowSoft : 'transparent',
          },
          isFilled && styles.otpFilled,
          animatedBorder,
        ]}
      >
        <Text style={[styles.otpDigit, { color: colors.text }]}>{digit}</Text>
        <TextInput
          ref={inputRef}
          value={digit}
          onChangeText={onChange}
          onKeyPress={({ nativeEvent }) => onKeyPress(nativeEvent.key)}
          onFocus={onFocus}
          keyboardType="number-pad"
          maxLength={1}
          style={styles.hiddenInput}
          caretHidden
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    gap: 16,
  },
  eyebrow: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 12,
    letterSpacing: 2.4,
  },
  headline: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 32,
    lineHeight: 38,
  },
  subtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  otpRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    justifyContent: 'center',
  },
  otpBox: {
    width: 64,
    height: 72,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpFilled: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  otpDigit: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28,
  },
  hiddenInput: {
    ...StyleSheet.absoluteFill,
    opacity: 0,
  },
  resend: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 20,
  },
  footer: {
    paddingTop: 16,
  },
});
