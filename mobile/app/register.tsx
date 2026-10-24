import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScalePressable } from '../components/AnimatedUI';
import { api, isConfigured } from '../lib/api';

export default function RegisterScreen() {
  const router = useRouter();
  const [data, setData] = useState({ name: '', businessName: '', email: '', phone: '', password: '', city: '', industry: '', linkedinUrl: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const field = (label: string, key: keyof typeof data, props: Record<string, any> = {}) => <View style={{ marginBottom: 16 }} key={key}><Text style={{ fontFamily: 'Ubuntu_500Medium', color: '#526789', marginBottom: 7 }}>{label}</Text><TextInput accessibilityLabel={label} value={data[key]} onChangeText={value => setData(old => ({ ...old, [key]: value }))} placeholder={label} autoCapitalize="none" style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DDE5F3', borderRadius: 14, fontFamily: 'Ubuntu_400Regular', fontSize: 16, padding: 15, color: '#102758' }} {...props} /></View>;
  const submit = async () => {
    setError(''); setBusy(true);
    try { await api.register({ ...data, verificationType: 'linkedin' }); setSubmitted(true); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to submit application'); }
    finally { setBusy(false); }
  };
  return <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#F8FAFE' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView contentContainerStyle={{ padding: 25, paddingTop: 50, paddingBottom: 50 }} keyboardShouldPersistTaps="handled">
    <ScalePressable onPress={() => router.back()} style={{ paddingBottom: 24 }}><Text style={{ color: '#234FC8', fontFamily: 'Ubuntu_500Medium' }}>← Sign in</Text></ScalePressable>
    <Text style={{ fontFamily: 'Ubuntu_700Bold', color: '#102758', fontSize: 31, marginBottom: 14 }}>{submitted ? 'Application received' : 'Join B Square'}</Text>
    <Text style={{ fontFamily: 'Ubuntu_400Regular', color: '#62728C', lineHeight: 23, marginBottom: 25 }}>{submitted ? 'Your account is pending manual review. You can sign in after approval.' : 'Tell us about your business. Applications require independent manual approval before members can access the network.'}</Text>
    {!submitted ? <>
      {field('Full name', 'name', { autoComplete: 'name' })}
      {field('Company / business name', 'businessName')}
      {field('Work email', 'email', { keyboardType: 'email-address' })}
      {field('Indian mobile number (10 digits)', 'phone', { keyboardType: 'phone-pad', maxLength: 10 })}
      {field('Password (8+ characters)', 'password', { secureTextEntry: true, autoComplete: 'new-password' })}
      {field('City', 'city')}
      {field('Industry', 'industry')}
      {field('LinkedIn profile URL', 'linkedinUrl', { keyboardType: 'url' })}
      <Text style={{ color: '#62728C', fontFamily: 'Ubuntu_400Regular', fontSize: 12, lineHeight: 19, marginBottom: 20 }}>Providing a LinkedIn URL does not verify your identity. A reviewer must approve your application.</Text>
      {error ? <Text style={{ color: '#A52D38', marginBottom: 14 }}>{error}</Text> : null}
      <PrimaryButton label={busy ? 'Submitting...' : 'Submit application'} disabled={busy || !isConfigured() || !data.name.trim() || !data.businessName.trim() || !data.email.includes('@') || !/^[6-9]\d{9}$/.test(data.phone) || data.password.length < 8 || !data.city.trim() || !data.linkedinUrl.includes('linkedin.com/in/')} onPress={submit} />
    </> : <PrimaryButton label="Return to sign in" onPress={() => router.replace('/login')} />}
  </ScrollView></KeyboardAvoidingView>;
}
