import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check, RefreshCw, ShieldCheck, X } from 'lucide-react-native';
import { api, AdmissionApplicant } from '../../lib/api';
import { useThemeColors } from '../../lib/theme';
import { Eyebrow } from '../../components/BrandUI';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScalePressable } from '../../components/AnimatedUI';

type Decision = { id: string; action: 'approve' | 'reject' };

export default function AdmissionReviewScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const [applications, setApplications] = useState<AdmissionApplicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [decision, setDecision] = useState<Decision | null>(null);
  const [note, setNote] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await api.pendingAdmissions();
      setApplications(data.applications);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load the approval queue');
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const act = async () => {
    if (!decision || saving || note.trim().length < 15) return;
    setSaving(true); setError(''); setNotice('');
    try {
      await api.decideAdmission(decision.id, decision.action, note.trim());
      setNotice(decision.action === 'approve' ? 'Application approved.' : 'Application rejected.');
      setDecision(null); setNote('');
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to record review'); }
    finally { setSaving(false); }
  };
  const fieldStyle = {
    color: c.text, backgroundColor: c.voidAlt, borderColor: c.glassBorder,
    borderWidth: 1 as const, borderRadius: 12, fontSize: 14,
    fontFamily: 'Ubuntu_400Regular' as const, padding: 14,
    minHeight: 96 as const, textAlignVertical: 'top' as const,
  };
  return <ScrollView style={{ flex: 1, backgroundColor: c.void }} contentContainerStyle={{ padding: 22, paddingTop: 45, paddingBottom: 85 }} keyboardShouldPersistTaps="handled">
    <ScalePressable onPress={() => router.back()} accessibilityRole="button" style={{ flexDirection: 'row', gap: 8, alignItems: 'center', paddingVertical: 12 }}>
      <ArrowLeft color={c.accent} size={19} />
      <Text style={{ color: c.accent, fontFamily: 'Ubuntu_500Medium' }}>My profile</Text>
    </ScalePressable>
    <View style={{ marginTop: 34 }}>
      <Eyebrow>PRIVATE / ADMIN ACCESS</Eyebrow>
      <Text style={{ color: c.text, fontSize: 35, lineHeight: 41, fontFamily: 'Ubuntu_700Bold', marginTop: 16 }}>Founder review.</Text>
      <Text style={{ color: c.textDim, fontFamily: 'Ubuntu_400Regular', lineHeight: 23, fontSize: 14, marginTop: 11 }}>Approve only after independently verifying the applicant's business and ownership. LinkedIn login and a mailbox code alone aren't proof.</Text>
    </View>
    <ScalePressable disabled={loading} onPress={load} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 20 }}>
      <RefreshCw color={c.accent} size={18} />
      <Text style={{ color: c.accent, fontFamily: 'Ubuntu_700Bold' }}>{loading ? 'Refreshing…' : 'Refresh applications'}</Text>
    </ScalePressable>
    {error ? <Text style={{ color: '#FFB6B6', marginVertical: 12, lineHeight: 21 }}>{error}</Text> : null}
    {notice ? <Text style={{ color: c.accent, marginVertical: 12 }}>{notice}</Text> : null}
    {loading ? <ActivityIndicator size="large" color={c.accent} style={{ marginTop: 40 }} /> : null}
    {!loading && !error && applications.length === 0 ? <View style={{ padding: 25, marginTop: 18, backgroundColor: c.surface, borderRadius: 15 }}>
      <ShieldCheck color={c.accent} size={28} />
      <Text style={{ color: c.text, fontFamily: 'Ubuntu_700Bold', fontSize: 19, marginTop: 12 }}>Queue cleared.</Text>
      <Text style={{ color: c.textDim, marginTop: 8 }}>There are no pending founder applications.</Text>
    </View> : null}
    {applications.map(a => <View key={a.id} style={{ backgroundColor: c.surface, borderRadius: 19, borderWidth: 1, borderColor: c.glassBorder, padding: 19, marginTop: 17 }}>
      <Text style={{ color: c.text, fontSize: 21, fontFamily: 'Ubuntu_700Bold' }}>{[a.firstName, a.lastName].filter(Boolean).join(' ') || 'Applicant'}</Text>
      <Text style={{ color: c.textDim, marginTop: 10, fontSize: 13, lineHeight: 20 }}>{a.email}</Text>
      <Text style={{ color: c.text, marginTop: 9, fontFamily: 'Ubuntu_500Medium' }}>{a.roleTitle || 'Role not supplied'} · {a.businessName || 'Business not supplied'}</Text>
      <Text style={{ color: c.textFaint, marginTop: 9, fontFamily: 'Ubuntu_400Regular', fontSize: 12 }}>{a.verificationType === 'linkedin' ? 'LinkedIn account sign-in' : 'Verified company mailbox'}</Text>
      {a.linkedinUrl && /^https:\/\/(www\.)?linkedin\.com\//i.test(a.linkedinUrl) ?
        <ScalePressable accessibilityRole="link" onPress={() => { void Linking.openURL(a.linkedinUrl!); }} style={{ paddingVertical: 12 }}>
          <Text style={{ color: c.accent, fontFamily: 'Ubuntu_500Medium' }}>Open supplied LinkedIn profile</Text>
        </ScalePressable> : null}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
        <ScalePressable accessibilityRole="button" onPress={() => { setDecision({ id: a.id, action: 'approve' }); setNote(''); }} style={{ flex: 1, borderWidth: 1, borderColor: c.accent, borderRadius: 11, padding: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
          <Check color={c.accent} size={16} />
          <Text style={{ color: c.accent, fontFamily: 'Ubuntu_700Bold' }}>Approve</Text>
        </ScalePressable>
        <ScalePressable accessibilityRole="button" onPress={() => { setDecision({ id: a.id, action: 'reject' }); setNote(''); }} style={{ flex: 1, borderWidth: 1, borderColor: '#FFB6B6', borderRadius: 11, padding: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
          <X color="#FFB6B6" size={16} />
          <Text style={{ color: '#FFB6B6', fontFamily: 'Ubuntu_700Bold' }}>Reject</Text>
        </ScalePressable>
      </View>
      {decision?.id === a.id ? <View style={{ marginTop: 19, borderTopColor: c.glassBorder, borderTopWidth: 1, paddingTop: 19 }}>
        <Text style={{ color: c.text, fontFamily: 'Ubuntu_700Bold', fontSize: 14 }}>{decision.action === 'approve' ? 'Evidence for approval' : 'Reason for rejection'}</Text>
        <Text style={{ color: c.textDim, fontFamily: 'Ubuntu_400Regular', fontSize: 12, lineHeight: 20, marginTop: 8, marginBottom: 10 }}>Record what was checked independently. At least 15 characters. This action changes the member's access immediately.</Text>
        <TextInput accessibilityLabel="Independent review evidence" multiline value={note} onChangeText={setNote} placeholder="Record source and findings…" placeholderTextColor={c.textFaint} style={fieldStyle} />
        <View style={{ gap: 12, marginTop: 13 }}>
          <PrimaryButton label={saving ? 'Saving review…' : decision.action === 'approve' ? 'Confirm approval' : 'Confirm rejection'} onPress={act} disabled={saving || note.trim().length < 15} />
          <ScalePressable onPress={() => { setDecision(null); setNote(''); }} accessibilityRole="button" style={{ padding: 12, alignItems: 'center' }}>
            <Text style={{ color: c.textDim, fontFamily: 'Ubuntu_500Medium' }}>Cancel</Text>
          </ScalePressable>
        </View>
      </View> : null}
    </View>)}
  </ScrollView>;
}
