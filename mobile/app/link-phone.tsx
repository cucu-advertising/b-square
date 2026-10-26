import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScalePressable } from '../components/AnimatedUI';
import { sendPhoneCode } from '../lib/firebasePhone';
import { useSession } from '../lib/session';

export default function LinkPhoneScreen() {
  const router = useRouter();
  const user = useSession(s => s.user);
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const send = async () => {
    if (!user) return;
    setBusy(true); setError('');
    try {
      const e164 = '+91' + phone;
      await sendPhoneCode(e164);
      router.push({ pathname: '/otp', params: { phone: e164, mode: 'link' } });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to send verification SMS');
    } finally { setBusy(false); }
  };
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#F8FAFE' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 25, paddingTop: 64, flexGrow: 1 }}>
        <ScalePressable onPress={() => router.back()} style={{ paddingBottom: 35 }}>
          <Text style={{ color: '#234FC8', fontFamily: 'Ubuntu_500Medium' }}>← My profile</Text>
        </ScalePressable>
        <Text style={{ fontFamily: 'Ubuntu_700Bold', fontSize: 32, color: '#102758' }}>Link your phone</Text>
        <Text style={{ fontFamily: 'Ubuntu_400Regular', color: '#61718D', lineHeight: 24, marginTop: 14, marginBottom: 28 }}>
          Verify your Indian mobile number by SMS to enable future phone sign-in. You must be signed in to link a number to your account.
        </Text>
        <Text style={{ color: '#526789', fontFamily: 'Ubuntu_500Medium', marginBottom: 8 }}>Mobile number</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 14, borderWidth: 1, borderColor: '#DDE5F3', paddingHorizontal: 15, marginBottom: 14 }}>
          <Text style={{ color: '#102758', fontSize: 16 }}>+91</Text>
          <TextInput value={phone} onChangeText={s => setPhone(s.replace(/\D/g, '').slice(0, 10))} maxLength={10} keyboardType="phone-pad" accessibilityLabel="Indian mobile number" placeholder="98765 43210" style={{ flex: 1, padding: 16, color: '#102758', fontSize: 16 }} />
        </View>
        {error ? <Text style={{ color: '#A52D38', marginBottom: 14 }}>{error}</Text> : null}
        <PrimaryButton label={busy ? 'Sending...' : 'Send verification code'} disabled={!user || busy || !/^[6-9]\d{9}$/.test(phone) || Platform.OS === 'web'} onPress={send} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
