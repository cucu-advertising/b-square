import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../lib/api';
import { useThemeColors } from '../lib/theme';
import { Eyebrow } from '../components/BrandUI';
import { PrimaryButton } from '../components/PrimaryButton';

export default function LinkedInApply() {
  const c = useThemeColors();
  const router = useRouter();
  const { ticket, name, email } = useLocalSearchParams<{ticket?: string; name?: string; email?: string}>();
  const [businessName, setBusinessName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [city, setCity] = useState('');
  const [industry, setIndustry] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const eligible = /\b(founder|co[ -]?founder|owner|managing director|proprietor|partner)\b/i.test(roleTitle);
  const submit = async () => {
    if (busy || !ticket || !eligible) return;
    setBusy(true); setError('');
    try {
      await api.applyLinkedIn({ ticket, businessName: businessName.trim(), roleTitle: roleTitle.trim(), city: city.trim(), industry: industry.trim() });
      setDone(true);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to submit application'); }
    finally { setBusy(false); }
  };
  const field = (label: string, value: string, onChangeText: (s: string) => void, placeholder: string) =>
    <View style={{ marginTop: 19 }}>
      <Text style={{ color: c.textDim, fontFamily: 'Ubuntu_500Medium', marginBottom: 8 }}>{label}</Text>
      <TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} autoCapitalize="words" placeholder={placeholder} placeholderTextColor={c.textFaint}
        style={{ color: c.text, backgroundColor: c.voidAlt, borderColor: c.glassBorder, borderWidth: 1, borderRadius: 13, padding: 16, fontFamily: 'Ubuntu_400Regular', fontSize: 16 }} />
    </View>;
  return <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.void }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 65, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
      <Eyebrow>B SQUARE / FOUNDER ADMISSION</Eyebrow>
      <Text style={{ color: c.text, fontFamily: 'Ubuntu_700Bold', fontSize: 39, lineHeight: 46, marginTop: 22 }}>{done ? 'Application received.' : 'Tell us what you build.'}</Text>
      <Text style={{ color: c.textDim, fontFamily: 'Ubuntu_400Regular', fontSize: 15, lineHeight: 24, marginTop: 17 }}>
        {done ? 'Your LinkedIn account is connected. Independent founder review is required before networking access.'
          : 'LinkedIn account details retrieved for ' + (name || email || 'this applicant') + '. Standard sign-in does not confirm your job title.'}
      </Text>
      {done ? <View style={{ marginTop: 40 }}><PrimaryButton label="Back to sign in" onPress={() => router.replace('/login')} /></View> : <>
        {field('Business / company name', businessName, setBusinessName, 'Your company')}
        {field('Founder or owner role', roleTitle, setRoleTitle, 'Founder or Co-founder')}
        {field('City', city, setCity, 'Hyderabad')}
        {field('Industry (optional)', industry, setIndustry, 'Your industry')}
        <Text style={{ color: c.textFaint, marginVertical: 24, fontFamily: 'Ubuntu_400Regular', fontSize: 12, lineHeight: 20 }}>LinkedIn authentication confirms account access, not the declared founder role. Every application requires an independent review.</Text>
        {error ? <Text style={{ color: '#FFB6B6', marginBottom: 14 }}>{error}</Text> : null}
        <PrimaryButton label={busy ? 'Submitting…' : 'Submit for founder review'} disabled={busy || !ticket || !eligible || businessName.trim().length < 2 || city.trim().length < 2} onPress={submit} />
      </>}
    </ScrollView>
  </KeyboardAvoidingView>;
}
