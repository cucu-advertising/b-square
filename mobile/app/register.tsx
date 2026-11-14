import { useThemeColors } from '../lib/theme';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScalePressable } from '../components/AnimatedUI';
import { api, isConfigured } from '../lib/api';

const INDUSTRIES = ['IT Services', 'Textiles & Garments', 'Food & Beverages', 'Pharmaceuticals', 'Logistics & Transport', 'Manufacturing', 'Real Estate', 'Finance & Banking', 'Healthcare', 'Education', 'Retail & Wholesale', 'Construction', 'Agriculture', 'Chemicals', 'Automotive', 'Other'];

export default function RegisterScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const scroll = useRef<ScrollView>(null);
  const [step, setStep] = useState<'email' | 'code' | 'profile' | 'done'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [lastSentAt, setLastSentAt] = useState(0);
  const [data, setData] = useState({ name: '', businessName: '', password: '', city: '', industry: '', linkedinUrl: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const cleanEmail = email.trim().toLowerCase();
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);
  const reveal = () => setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 180);
  const begin = () => { setError(''); setStep('email'); setVerificationToken(''); setCode(''); };
  const sendCode = async () => {
    if (!validEmail || busy || !isConfigured() || (lastSentAt && Date.now() - lastSentAt < 60000)) return;
    setBusy(true); setError('');
    try {
      await api.requestSignupCode(cleanEmail);
      setLastSentAt(Date.now());
      setStep('code');
      setCode('');
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to send verification code.'); }
    finally { setBusy(false); }
  };
  const verifyCode = async () => {
    if (busy || !/^\d{6}$/.test(code)) return;
    setBusy(true); setError('');
    try {
      const result = await api.verifySignupCode(cleanEmail, code);
      setVerificationToken(result.verificationToken);
      setStep('profile');
    } catch (e) { setError(e instanceof Error ? e.message : 'Email verification failed.'); }
    finally { setBusy(false); }
  };
  const submit = async () => {
    if (busy || !verificationToken) return;
    setBusy(true); setError('');
    try {
      await api.registerVerified({ ...data, email: cleanEmail, verificationToken, verificationType: 'linkedin' });
      setStep('done');
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to submit application.'); }
    finally { setBusy(false); }
  };
  const field = (label: string, key: keyof typeof data, props: Record<string, any> = {}) =>
    <View style={{ marginBottom: 17 }} key={key}>
      <Text style={{ color: colors.textDim, fontFamily: 'Ubuntu_500Medium', marginBottom: 7 }}>{label}</Text>
      <TextInput accessibilityLabel={label} value={data[key]}
        onChangeText={value => setData(old => ({ ...old, [key]: value }))}
        autoCorrect={false} onFocus={reveal} placeholder={label}
        style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.glassBorder, borderRadius: 14, padding: 16, color: colors.text, fontSize: 16, fontFamily: 'Ubuntu_400Regular' }}
        {...props} />
    </View>;
  return <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.void }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView ref={scroll} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 25, paddingTop: 50, paddingBottom: 64 }}>
      <ScalePressable onPress={() => step === 'profile' || step === 'code' ? begin() : router.replace('/login')} style={{ paddingVertical: 12 }}>
        <Text style={{ color: colors.accent, fontFamily: 'Ubuntu_500Medium' }}>← {step === 'code' || step === 'profile' ? 'Change email' : 'Sign in'}</Text>
      </ScalePressable>
      <Text style={{ fontFamily: 'Ubuntu_500Medium', color: colors.accent, fontSize: 12, letterSpacing: 1.5, marginTop: 28 }}>B SQUARE  ·  MEMBERSHIP</Text>
      <Text style={{ fontFamily: 'Ubuntu_700Bold', color: colors.text, fontSize: 33, lineHeight: 41, marginTop: 10 }}>
        {step === 'email' ? 'Start with your email.' : step === 'code' ? 'Check your inbox.' : step === 'profile' ? 'Tell us about your business.' : 'Application received.'}
      </Text>
      <Text style={{ fontFamily: 'Ubuntu_400Regular', color: colors.textDim, fontSize: 15, lineHeight: 24, marginTop: 12, marginBottom: 30 }}>
        {step === 'email' ? 'Verify your email before creating your B Square membership application.' : step === 'code' ? 'Enter the 6-digit code we sent to your email. It expires in 5 minutes.' : step === 'profile' ? 'Your email is verified. Complete your application using the details below.' : 'Your email is verified and your application has been submitted.'}
      </Text>
      {step === 'email' ? <>
        <Text style={{ color: colors.textDim, fontFamily: 'Ubuntu_500Medium', marginBottom: 9 }}>Email address</Text>
        <TextInput accessibilityLabel="New member email address" value={email}
          onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="emailAddress"
          keyboardType="email-address" placeholder="you@company.com" onFocus={reveal} returnKeyType="done" onSubmitEditing={sendCode}
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.glassBorder, borderRadius: 14, padding: 16, color: colors.text, fontFamily: 'Ubuntu_400Regular', fontSize: 16, marginBottom: 20 }} />
        <PrimaryButton label={busy ? 'Sending...' : 'Send verification code'} disabled={!validEmail || busy || !isConfigured()} onPress={sendCode} />
      </> : null}
      {step === 'code' ? <>
        <Text style={{ color: colors.textDim, fontFamily: 'Ubuntu_500Medium', marginBottom: 12 }}>{cleanEmail}</Text>
        <TextInput accessibilityLabel="Six-digit email verification code" value={code}
          onChangeText={v => setCode(v.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad"
          autoComplete="one-time-code" textContentType="oneTimeCode" maxLength={6} placeholder="000000" onFocus={reveal}
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.glassBorder, borderRadius: 14, padding: 18, color: colors.text, fontFamily: 'Ubuntu_700Bold', fontSize: 25, letterSpacing: 7, textAlign: 'center', marginBottom: 18 }} />
        <PrimaryButton label={busy ? 'Verifying...' : 'Verify email'} disabled={busy || code.length !== 6} onPress={verifyCode} />
        <ScalePressable onPress={sendCode} disabled={busy} style={{ alignItems: 'center', paddingVertical: 22 }}>
          <Text style={{ color: colors.accent, fontFamily: 'Ubuntu_500Medium' }}>Resend code (after 60 seconds)</Text>
        </ScalePressable>
      </> : null}
      {step === 'profile' ? <>
        <View style={{ backgroundColor: colors.voidAlt, borderRadius: 14, padding: 14, marginBottom: 24 }}>
          <Text style={{ color: colors.accent, fontFamily: 'Ubuntu_500Medium' }}>✓ Email verified: {cleanEmail}</Text>
        </View>
        {field('Full name', 'name', { autoCapitalize: 'words', autoComplete: 'name' })}
        {field('Company / business name', 'businessName', { autoCapitalize: 'words' })}
        {field('Create password (8+ characters)', 'password', { secureTextEntry: true, autoCapitalize: 'none', autoComplete: 'new-password' })}
        {field('City', 'city', { autoCapitalize: 'words' })}
        <Text style={{ color: colors.textDim, fontFamily: 'Ubuntu_500Medium', marginBottom: 9 }}>Industry (optional)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 21 }} keyboardShouldPersistTaps="handled">
          {INDUSTRIES.map(industry => <ScalePressable key={industry} onPress={() => setData(prev => ({ ...prev, industry }))}
            style={{ borderRadius: 18, paddingHorizontal: 15, paddingVertical: 10, marginRight: 8, backgroundColor: data.industry === industry ? colors.accent : colors.voidAlt }}>
            <Text style={{ color: data.industry === industry ? colors.text : colors.textDim, fontFamily: 'Ubuntu_500Medium', fontSize: 13 }}>{industry}</Text>
          </ScalePressable>)}
        </ScrollView>
        {field('LinkedIn profile URL', 'linkedinUrl', { keyboardType: 'url', autoCapitalize: 'none' })}
        <Text style={{ color: colors.textDim, fontSize: 12, lineHeight: 19, marginBottom: 20 }}>A LinkedIn URL does not by itself verify business ownership. Membership remains subject to B Square's review process.</Text>
        <PrimaryButton label={busy ? 'Submitting...' : 'Submit membership application'}
          disabled={busy || !data.name.trim() || !data.businessName.trim() || data.password.length < 8 || !data.city.trim() || !data.linkedinUrl.includes('linkedin.com/in/')}
          onPress={submit} />
      </> : null}
      {step === 'done' ? <PrimaryButton label="Back to sign in" onPress={() => router.replace('/login')} /> : null}
      {error ? <Text style={{ color: '#A04440', fontFamily: 'Ubuntu_400Regular', marginTop: 16, lineHeight: 22 }}>{error}</Text> : null}
    </ScrollView>
  </KeyboardAvoidingView>;
}
