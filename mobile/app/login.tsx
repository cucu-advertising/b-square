import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSession } from '../lib/session';
import { useThemeColors } from '../lib/theme';
import { isConfigured } from '../lib/api';
import { LinkedInButton } from '../components/LinkedInButton';
import { PrimaryButton } from '../components/PrimaryButton';
import { BrandMark, Eyebrow } from '../components/BrandUI';
import { ScalePressable } from '../components/AnimatedUI';

export default function LoginScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const signIn = useSession(s => s.signIn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async () => {
    if (busy) return;
    setBusy(true); setError('');
    try { await signIn(email, password); router.replace('/(tabs)/nearby'); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to sign in'); }
    finally { setBusy(false); }
  };
  const field = { color: c.text, fontFamily: 'Ubuntu_400Regular' as const, fontSize: 16, padding: 16, backgroundColor: '#081F5B', borderColor: c.glassBorder, borderWidth: 1, borderRadius: 13, marginBottom: 14 };
  return <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.void }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingTop: 54, paddingHorizontal: 26, paddingBottom: 50, flexGrow: 1 }}>
      <BrandMark size={43} />
      <View style={{ marginTop: 66 }}><Eyebrow>THE VERIFIED BUSINESS NETWORK</Eyebrow></View>
      <Text style={{ color: c.text, fontFamily: 'Ubuntu_700Bold', fontSize: 44, lineHeight: 49, letterSpacing: -1, marginTop: 22 }}>Let's get</Text>
      <Text style={{ color: c.accent, fontFamily: 'Ubuntu_700Bold', fontSize: 44, lineHeight: 49, letterSpacing: -1 }}>you in.</Text>
      <Text style={{ color: c.textDim, fontFamily: 'Ubuntu_400Regular', fontSize: 16, lineHeight: 25, marginTop: 21, marginBottom: 40 }}>A trusted network for business owners. Your circle is waiting.</Text>
      {showPassword ? <>
        <Text style={{ color: c.textDim, fontFamily: 'Ubuntu_500Medium', marginBottom: 9, fontSize: 12, letterSpacing: 1 }}>EMAIL ADDRESS</Text>
        <TextInput accessibilityLabel="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoComplete="email" autoCapitalize="none" placeholder="you@company.com" placeholderTextColor={c.textFaint} style={field} />
        <Text style={{ color: c.textDim, fontFamily: 'Ubuntu_500Medium', marginBottom: 9, fontSize: 12, letterSpacing: 1 }}>PASSWORD</Text>
        <TextInput accessibilityLabel="Password" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" placeholder="Your password" placeholderTextColor={c.textFaint} style={field} />
        <PrimaryButton label={busy ? 'Signing in...' : 'Sign in'} disabled={busy || !isConfigured() || !email.includes('@') || !password} onPress={submit} />
        <ScalePressable onPress={() => router.push('/forgot-password')} style={{ alignItems: 'center', padding: 17 }}><Text style={{ color: c.accent, fontFamily: 'Ubuntu_500Medium' }}>Forgot password?</Text></ScalePressable>
      </> : <PrimaryButton label="Continue with email code" onPress={() => router.push('/email-sign-in')} />}
      <View style={{ marginTop: 13 }}><LinkedInButton label="Continue with LinkedIn" /></View>
      {!isConfigured() ? <Text style={{ color: '#FFB6B6', fontSize: 12, marginTop: 16 }}>The Bsquare API URL has not been configured.</Text> : null}
      {error ? <Text style={{ color: '#FFB6B6', fontSize: 13, marginTop: 16 }}>{error}</Text> : null}
      <ScalePressable onPress={() => setShowPassword(v => !v)} style={{ borderRadius: 13, borderColor: c.accent, borderWidth: 1, paddingVertical: 16, alignItems: 'center', marginTop: 14 }}>
        <Text style={{ color: c.accent, fontFamily: 'Ubuntu_700Bold' }}>{showPassword ? 'Use email code instead' : 'Sign in with password'}</Text>
      </ScalePressable>
      <View style={{ flex: 1, minHeight: 35 }} />
      <ScalePressable onPress={() => router.push('/register')} style={{ paddingVertical: 16, alignItems: 'center' }}>
        <Text style={{ fontFamily: 'Ubuntu_500Medium', color: c.textDim }}>New to Bsquare? <Text style={{ color: c.accent }}>Apply to join</Text></Text>
      </ScalePressable>
    </ScrollView>
  </KeyboardAvoidingView>;
}
