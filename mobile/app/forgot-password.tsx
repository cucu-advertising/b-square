import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScalePressable } from '../components/AnimatedUI';
import { api } from '../lib/api';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const submit = async () => {
    if (busy || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return;
    setBusy(true); setError('');
    try {
      await api.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to request reset email. Try again.');
    } finally { setBusy(false); }
  };
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#F7F6F2' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 26, paddingTop: 66, paddingBottom: 45 }}>
        <ScalePressable onPress={() => router.back()} accessibilityRole="button" style={{ paddingVertical: 12 }}>
          <Text style={{ fontFamily: 'Ubuntu_500Medium', color: '#385A53' }}>← Back to sign in</Text>
        </ScalePressable>
        <Text style={{ fontFamily: 'Ubuntu_700Bold', fontSize: 34, lineHeight: 42, color: '#223A33', marginTop: 42 }}>
          Reset your password.
        </Text>
        <Text style={{ fontFamily: 'Ubuntu_400Regular', fontSize: 16, lineHeight: 25, color: '#687870', marginTop: 16, marginBottom: 38 }}>
          {sent ? 'If this address belongs to an account, a password-reset link is on its way. Check your inbox and spam folder.' : 'Enter your registered email. We’ll send you a secure link to set a new password.'}
        </Text>
        {!sent ? <>
          <Text style={{ fontFamily: 'Ubuntu_500Medium', color: '#5E7067', marginBottom: 8 }}>Email address</Text>
          <TextInput value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="emailAddress" returnKeyType="done" onSubmitEditing={submit} accessibilityLabel="Registered email address" placeholder="you@company.com" style={{ borderWidth: 1, borderColor: '#E0E5DD', borderRadius: 14, backgroundColor: '#FFFFFF', padding: 16, color: '#223A33', fontFamily: 'Ubuntu_400Regular', fontSize: 16, marginBottom: 18 }} />
          {error ? <Text style={{ color: '#A04440', marginBottom: 14 }}>{error}</Text> : null}
          <PrimaryButton label={busy ? 'Sending...' : 'Send reset link'} disabled={busy || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())} onPress={submit} />
        </> : <PrimaryButton label="Back to sign in" onPress={() => router.replace('/login')} />}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
