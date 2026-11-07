import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScalePressable } from '../components/AnimatedUI';
import { api } from '../lib/api';
import { useSession } from '../lib/session';

export default function EmailSignIn() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const signInWithEmailCode = useSession(s => s.signInWithEmailCode);
  const [email, setEmail] = useState(typeof params.email === 'string' ? params.email : '');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [lastSentAt, setLastSentAt] = useState(0);
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const requestCode = async () => {
    if (!validEmail || busy || (lastSentAt && Date.now() - lastSentAt < 60000)) return;
    setBusy(true); setError(''); setInfo('');
    try {
      await api.requestEmailCode(email);
      setSent(true);
      setCode('');
      setLastSentAt(Date.now());
      setInfo('If this address belongs to an account, a code will arrive shortly. Check spam too.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not request a code.'); }
    finally { setBusy(false); }
  };

  const verify = async () => {
    if (!sent || !/^\d{6}$/.test(code) || busy) return;
    setBusy(true); setError(''); setInfo('');
    try {
      await signInWithEmailCode(email, code);
      router.replace('/(tabs)/nearby');
    } catch (e) { setError(e instanceof Error ? e.message : 'Code verification failed.'); }
    finally { setBusy(false); }
  };

  return <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#F7F6F2' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 26, paddingTop: 42, paddingBottom: 44 }}>
      <ScalePressable onPress={() => router.back()} style={{ paddingVertical: 12 }}>
        <Text style={{ fontFamily: 'Ubuntu_500Medium', color: '#385A53' }}>← Back</Text>
      </ScalePressable>
      <Text style={{ fontFamily: 'Ubuntu_700Bold', color: '#223A33', fontSize: 35, lineHeight: 43, marginTop: 31 }}>Welcome back.</Text>
      <Text style={{ fontFamily: 'Ubuntu_400Regular', color: '#687870', fontSize: 16, lineHeight: 25, marginTop: 14, marginBottom: 32 }}>
        Your next connection is one verification away. Enter your registered email and we’ll send a secure sign-in code.
      </Text>
      <Text style={{ fontFamily: 'Ubuntu_500Medium', color: '#5E7067', marginBottom: 9 }}>Registered email</Text>
      <TextInput
        value={email} onChangeText={v => { setEmail(v); setSent(false); setCode(''); setInfo(''); }}
        autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="emailAddress"
        keyboardType="email-address" accessibilityLabel="Registered email"
        placeholder="you@company.com"
        style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E5DD', borderRadius: 15, padding: 17, color: '#223A33', fontFamily: 'Ubuntu_400Regular', fontSize: 16, marginBottom: 18 }}
      />
      {!sent ? <PrimaryButton label={busy ? 'Sending...' : 'Send email code'} disabled={!validEmail || busy} onPress={requestCode} /> : <>
        <Text style={{ fontFamily: 'Ubuntu_500Medium', color: '#5E7067', marginTop: 22, marginBottom: 9 }}>6-digit email code</Text>
        <TextInput value={code} onChangeText={v => setCode(v.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" autoComplete="one-time-code" textContentType="oneTimeCode" maxLength={6} accessibilityLabel="Email verification code" placeholder="000000" style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E5DD', borderRadius: 15, padding: 18, color: '#223A33', fontFamily: 'Ubuntu_700Bold', fontSize: 25, letterSpacing: 7, textAlign: 'center', marginBottom: 18 }} />
        <PrimaryButton label={busy ? 'Verifying...' : 'Verify and sign in'} disabled={busy || code.length !== 6} onPress={verify} />
        <ScalePressable accessibilityRole="button" onPress={requestCode} disabled={busy} style={{ paddingVertical: 21, alignItems: 'center' }}>
          <Text style={{ color: '#385A53', fontFamily: 'Ubuntu_500Medium' }}>Resend code (available after 60 seconds)</Text>
        </ScalePressable>
      </>}
      {info ? <Text style={{ color: '#5E7067', fontFamily: 'Ubuntu_400Regular', marginTop: 15, lineHeight: 22 }}>{info}</Text> : null}
      {error ? <Text style={{ color: '#A04440', fontFamily: 'Ubuntu_400Regular', marginTop: 15, lineHeight: 22 }}>{error}</Text> : null}
      <Text style={{ color: '#909D92', fontFamily: 'Ubuntu_400Regular', fontSize: 12, lineHeight: 19, marginTop: 30 }}>
        Codes expire in 5 minutes and are valid for one sign-in. Never share your code.
      </Text>
    </ScrollView>
  </KeyboardAvoidingView>;
}
