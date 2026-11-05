import { useRef, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScalePressable } from '../components/AnimatedUI';
import { isConfigured } from '../lib/api';
import { sendPhoneCode } from '../lib/firebasePhone';
import { useSession } from '../lib/session';

export default function LoginScreen() {
  const router = useRouter();
  const signIn = useSession(s => s.signIn);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const revealInputs = () => { setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 180); };
  const sendOTP = async () => {
    setBusy(true); setError('');
    try {
      const e164 = '+91' + phone.replace(/\D/g, '');
      await sendPhoneCode(e164);
      router.push({ pathname: '/otp', params: { phone: e164 } });
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not send verification code'); }
    finally { setBusy(false); }
  };
  const submit = async () => {
    setBusy(true); setError('');
    try { await signIn(email, password); router.replace('/(tabs)/nearby'); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to sign in'); }
    finally { setBusy(false); }
  };
  return <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#F8FAFE' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView ref={scrollRef} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 26, paddingTop: 60, paddingBottom: 35 }}>
      <Image source={require('../assets/brand-logo.png')} resizeMode="contain" accessibilityLabel="B Square" style={{ width: 116, height: 116 }} />
      <Text style={{ fontFamily: 'Ubuntu_700Bold', fontSize: 36, lineHeight: 43, color: '#102758', marginTop: 26 }}>Your network. Your next opportunity.</Text>
      <Text style={{ fontFamily: 'Ubuntu_400Regular', fontSize: 16, lineHeight: 25, color: '#61718D', marginTop: 16, marginBottom: 35 }}>Sign in with SMS after linking your phone in your account profile. First time? Sign in with your existing email and password, then link your phone.</Text>
      {!isConfigured() ? <Text style={{ color: '#9C3D39', fontSize: 14, lineHeight: 21, marginBottom: 18 }}>API not configured. Set EXPO_PUBLIC_BSQUARE_API_URL to your deployed backend address.</Text> : null}
      <Text style={{ color: '#526789', fontFamily: 'Ubuntu_500Medium', marginBottom: 8 }}>Mobile number</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderWidth: 1, borderColor: '#DDE5F3', borderRadius: 14, paddingHorizontal: 16, marginBottom: 14 }}>
        <Text style={{ fontFamily: 'Ubuntu_500Medium', fontSize: 16, color: '#102758' }}>+91</Text>
        <TextInput accessibilityLabel="Mobile number" value={phone} onChangeText={t => setPhone(t.replace(/\D/g, '').slice(0, 10))} keyboardType="phone-pad" maxLength={10} placeholder="98765 43210" style={{ flex: 1, padding: 16, fontFamily: 'Ubuntu_500Medium', fontSize: 16, color: '#102758' }} />
      </View>
      <PrimaryButton label={busy ? 'Sending...' : 'Send verification code'} disabled={busy || !isConfigured() || !/^[6-9]\d{9}$/.test(phone) || Platform.OS === 'web'} onPress={sendOTP} />
      {Platform.OS === 'web' ? <Text style={{ fontFamily: 'Ubuntu_400Regular', fontSize: 12, color: '#62728C', marginTop: 10 }}>Firebase SMS sign-in is available in Android/iOS builds, not the browser preview.</Text> : null}
      <ScalePressable accessibilityRole="button" onPress={() => router.push({ pathname: '/email-sign-in', params: { email } })} style={{ marginTop: 24, backgroundColor: '#ECF2FF', borderRadius: 16, paddingVertical: 17, paddingHorizontal: 18, alignItems: 'center' }}><Text style={{ fontFamily: 'Ubuntu_700Bold', fontSize: 15, color: '#234FC8' }}>Sign in with email code →</Text></ScalePressable>
      <Text style={{ fontFamily:'Ubuntu_500Medium',textAlign:'center',color:'#61718D',marginTop:26,marginBottom:22 }}>OR USE EMAIL & PASSWORD</Text>
      <Text style={{ color: '#526789', fontFamily: 'Ubuntu_500Medium', marginBottom: 8 }}>Email</Text>
      <TextInput accessibilityLabel="Email" value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="emailAddress" onFocus={revealInputs} keyboardType="email-address" placeholder="you@company.com" style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#DDE5F3', borderRadius: 14, padding: 16, color: '#102758', fontFamily: 'Ubuntu_400Regular', fontSize: 16, marginBottom: 20 }} />
      <Text style={{ color: '#526789', fontFamily: 'Ubuntu_500Medium', marginBottom: 8 }}>Password</Text>
      <TextInput accessibilityLabel="Password" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoCorrect={false} autoComplete="password" onFocus={revealInputs} placeholder="Your password" style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#DDE5F3', borderRadius: 14, padding: 16, color: '#102758', fontFamily: 'Ubuntu_400Regular', fontSize: 16, marginBottom: 12 }} />
      {error ? <Text style={{ color: '#A52D38', fontFamily: 'Ubuntu_400Regular', marginBottom: 12 }}>{error}</Text> : null}
      <ScalePressable accessibilityRole="button" onPress={() => { Keyboard.dismiss(); router.push('/forgot-password'); }} style={{ alignSelf: 'flex-end', paddingVertical: 14, marginTop: -2 }}><Text style={{ color: '#234FC8', fontFamily: 'Ubuntu_500Medium', fontSize: 14 }}>Forgot password?</Text></ScalePressable>
      <View style={{ marginTop: 8 }}><PrimaryButton label={busy ? 'Signing in...' : 'Sign in'} disabled={!isConfigured() || busy || !email.includes('@') || !password} onPress={submit} /></View>
      <ScalePressable onPress={() => router.push('/register')} style={{ paddingVertical: 24, alignItems: 'center' }}><Text style={{ color: '#234FC8', fontFamily: 'Ubuntu_500Medium', fontSize: 15 }}>Apply for B Square membership →</Text></ScalePressable>
    </ScrollView>
  </KeyboardAvoidingView>;
}
