import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScalePressable } from '../components/AnimatedUI';
import { confirmPhoneCode, sendPhoneCode } from '../lib/firebasePhone';
import { useSession } from '../lib/session';
import { api } from '../lib/api';

export default function OTP() {
  const { phone, mode } = useLocalSearchParams<{ phone?: string; mode?: string }>();
  const router = useRouter();
  const signInWithPhone = useSession(s => s.signInWithPhone);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const verifiedPhone = typeof phone === 'string' && /^\+91[6-9]\d{9}$/.test(phone) ? phone : null;
  const verify = async () => {
    if (!verifiedPhone || busy) return;
    setBusy(true); setError('');
    try {
      const firebaseToken = await confirmPhoneCode(code);
      if (mode === 'link') {
        await api.linkFirebasePhone(firebaseToken);
        router.replace('/(tabs)/profile');
      } else {
        await signInWithPhone(firebaseToken);
        router.replace('/(tabs)/nearby');
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Verification failed'); }
    finally { setBusy(false); }
  };
  const resend = async () => {
    if (!verifiedPhone || busy) return;
    setBusy(true); setError('');
    try { await sendPhoneCode(verifiedPhone); setCode(''); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not resend code'); }
    finally { setBusy(false); }
  };
  return <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#F8FAFE' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 26, paddingTop: 65, paddingBottom: 40, flexGrow: 1 }}>
      <ScalePressable onPress={() => router.replace('/login')}><Text style={{ fontFamily:'Ubuntu_500Medium', color:'#234FC8' }}>← Back</Text></ScalePressable>
      <Text style={{ fontFamily:'Ubuntu_700Bold', fontSize:32, color:'#102758', marginTop:42 }}>Verify your phone</Text>
      <Text style={{ fontFamily:'Ubuntu_400Regular', fontSize:15, color:'#61718D', lineHeight:24, marginTop:15, marginBottom:30 }}>Enter the 6-digit SMS code sent to {verifiedPhone || 'your phone'}.</Text>
      <TextInput value={code} onChangeText={t => setCode(t.replace(/\D/g,'').slice(0,6))} keyboardType="number-pad" autoComplete="sms-otp" textContentType="oneTimeCode" maxLength={6} accessibilityLabel="Six-digit verification code" placeholder="000000" style={{ backgroundColor:'white', borderWidth:1, borderColor:'#DDE5F3', padding:19, borderRadius:16, fontFamily:'Ubuntu_700Bold', fontSize:26, letterSpacing:8, color:'#102758', textAlign:'center' }} />
      {error ? <Text style={{ color:'#A52D38', marginTop:16 }}>{error}</Text> : null}
      <View style={{ marginTop:26 }}><PrimaryButton label={busy?'Checking...': mode === 'link' ? 'Verify & link phone' : 'Verify & sign in'} disabled={!verifiedPhone || busy || code.length!==6} onPress={verify} /></View>
      <ScalePressable onPress={resend} disabled={!verifiedPhone || busy} style={{ alignItems:'center', paddingVertical:24 }}><Text style={{ fontFamily:'Ubuntu_500Medium', color:'#234FC8' }}>Resend code</Text></ScalePressable>
    </ScrollView>
  </KeyboardAvoidingView>;
}
