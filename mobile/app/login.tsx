import { useThemeColors } from '../lib/theme';
import { useRef, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScalePressable } from '../components/AnimatedUI';
import { isConfigured } from '../lib/api';
import { useSession } from '../lib/session';

export default function LoginScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const signIn = useSession(s => s.signIn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const revealInputs = () => { setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 180); };
  const submit = async () => {
    setBusy(true); setError('');
    try { await signIn(email, password); router.replace('/(tabs)/nearby'); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to sign in'); }
    finally { setBusy(false); }
  };
  return <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.void }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView ref={scrollRef} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 26, paddingTop: 60, paddingBottom: 35 }}>
      <Image source={require('../assets/brand-logo.png')} resizeMode="contain" accessibilityLabel="B Square" style={{ width: 116, height: 116 }} />
      <Text style={{ fontFamily: 'Ubuntu_700Bold', fontSize: 36, lineHeight: 43, color: colors.text, marginTop: 26 }}>Business moves through people.</Text>
      <Text style={{ fontFamily: 'Ubuntu_400Regular', fontSize: 16, lineHeight: 25, color: colors.textDim, marginTop: 16, marginBottom: 28 }}>A private place for meaningful business connections. Welcome back.</Text>
      {!isConfigured() ? <Text style={{ color: '#A04440', fontSize: 14, lineHeight: 21, marginBottom: 18 }}>API not configured. Set EXPO_PUBLIC_BSQUARE_API_URL to your deployed backend address.</Text> : null}
      <ScalePressable accessibilityRole="button" onPress={() => router.push({ pathname: '/email-sign-in', params: { email } })} style={{ marginTop: 14, backgroundColor: colors.voidAlt, borderRadius: 16, paddingVertical: 17, paddingHorizontal: 18, alignItems: 'center' }}><Text style={{ fontFamily: 'Ubuntu_700Bold', fontSize: 15, color: colors.accent }}>Send me a sign-in code →</Text></ScalePressable>
      <Text style={{ fontFamily:'Ubuntu_500Medium',textAlign:'center',color:colors.textDim,marginTop:26,marginBottom:22 }}>OR CONTINUE WITH PASSWORD</Text>
      <Text style={{ color: colors.textDim, fontFamily: 'Ubuntu_500Medium', marginBottom: 8 }}>Email</Text>
      <TextInput accessibilityLabel="Email" value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="emailAddress" onFocus={revealInputs} keyboardType="email-address" placeholder="you@company.com" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.glassBorder, borderRadius: 14, padding: 16, color: colors.text, fontFamily: 'Ubuntu_400Regular', fontSize: 16, marginBottom: 20 }} />
      <Text style={{ color: colors.textDim, fontFamily: 'Ubuntu_500Medium', marginBottom: 8 }}>Password</Text>
      <TextInput accessibilityLabel="Password" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoCorrect={false} autoComplete="password" onFocus={revealInputs} placeholder="Your password" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.glassBorder, borderRadius: 14, padding: 16, color: colors.text, fontFamily: 'Ubuntu_400Regular', fontSize: 16, marginBottom: 12 }} />
      {error ? <Text style={{ color: '#A04440', fontFamily: 'Ubuntu_400Regular', marginBottom: 12 }}>{error}</Text> : null}
      <ScalePressable accessibilityRole="button" onPress={() => { Keyboard.dismiss(); router.push('/forgot-password'); }} style={{ alignSelf: 'flex-end', paddingVertical: 14, marginTop: -2 }}><Text style={{ color: colors.accent, fontFamily: 'Ubuntu_500Medium', fontSize: 14 }}>Forgot password?</Text></ScalePressable>
      <View style={{ marginTop: 8 }}><PrimaryButton label={busy ? 'Signing in...' : 'Sign in'} disabled={!isConfigured() || busy || !email.includes('@') || !password} onPress={submit} /></View>
      <ScalePressable onPress={() => router.push('/register')} style={{ paddingVertical: 24, alignItems: 'center' }}><Text style={{ color: colors.accent, fontFamily: 'Ubuntu_500Medium', fontSize: 15 }}>Apply for B Square membership →</Text></ScalePressable>
    </ScrollView>
  </KeyboardAvoidingView>;
}
