import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { useThemeColors } from '../lib/theme';
import { useAuthStore } from '../lib/store';

export default function LoginScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const setPhone = useAuthStore((s) => s.setPhone);
  const [phone, setPhoneLocal] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSendCode = () => {
    setPhone(phone);
    router.push('/otp');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.void, paddingTop: insets.top + 32 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <Text style={[styles.eyebrow, { color: colors.accent }]}>STEP 01</Text>
        <Text style={[styles.headline, { color: colors.text }]}>
          Let's verify you're a real business.
        </Text>
        <Text style={[styles.subtext, { color: colors.textDim }]}>
          We'll send a one-time code to your registered business phone. Only verified owners get
          into B Square.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textFaint }]}>PHONE NUMBER</Text>
          <View
            style={[
              styles.inputRow,
              {
                backgroundColor: colors.glass,
                borderColor: focused ? colors.glowSoft : colors.glassBorder,
                shadowColor: focused ? colors.glow : 'transparent',
              },
              focused && styles.inputFocused,
            ]}
          >
            <Text style={[styles.prefix, { color: colors.textDim }]}>+91</Text>
            <TextInput
              value={phone}
              onChangeText={setPhoneLocal}
              placeholder="98765 43210"
              placeholderTextColor={colors.textFaint}
              keyboardType="phone-pad"
              maxLength={10}
              style={[styles.input, { color: colors.text }]}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
          </View>
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <PrimaryButton label="Send code" onPress={handleSendCode} disabled={phone.length < 10} />
      </View>
    </KeyboardAvoidingView>
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
    marginTop: 4,
  },
  inputGroup: {
    marginTop: 24,
    gap: 10,
  },
  label: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 1.8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputFocused: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 4,
  },
  prefix: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 16,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 18,
    paddingVertical: 14,
  },
  footer: {
    paddingTop: 16,
  },
});
