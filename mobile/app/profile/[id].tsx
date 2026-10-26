import { useCallback, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useFocusEffect, useRouter } from 'expo-router';
import { api, Member } from '../../lib/api';
import { SectionHeading, LoadingState, MessageState } from '../../components/ScreenStates';
import { ScalePressable } from '../../components/AnimatedUI';
import { PrimaryButton } from '../../components/PrimaryButton';
export default function MemberScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); const router = useRouter();
  const [member, setMember] = useState<Member | null>(null); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false);
  const [error, setError] = useState(''); const [reason, setReason] = useState(''); const [showReport, setShowReport] = useState(false);
  const refresh = useCallback(async () => { if (!id) return; setLoading(true); try { const data = await api.member(id); setMember(data.user); setError(''); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to fetch profile'); } finally { setLoading(false); } }, [id]);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));
  const action = async (what: 'connect' | 'block' | 'report') => { if (!id || busy) return; setBusy(true); setError(''); try {
    if (what === 'connect') { await api.connect(id); await refresh(); }
    if (what === 'block') { await api.block(id); router.replace('/(tabs)/nearby'); }
    if (what === 'report') { if (reason.trim().length < 5) { setError('Please provide a reason of at least five characters.'); return; } await api.report(id, reason.trim()); setShowReport(false); setReason(''); Alert.alert('Report submitted', 'Our team will review your report.'); }
  } catch (e) { setError(e instanceof Error ? e.message : 'Action failed'); } finally { setBusy(false); } };
  const confirmBlock = () => Alert.alert('Block member?', 'Blocking removes your connection and prevents further contact.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Block', style: 'destructive', onPress: () => action('block') }]);
  return <View style={{ flex: 1, backgroundColor: '#F8FAFE' }}><ScalePressable onPress={() => router.back()} style={{ paddingHorizontal: 24, paddingTop: 35, paddingBottom: 5 }}><Text style={{ color: '#234FC8', fontFamily: 'Ubuntu_500Medium' }}>← Back</Text></ScalePressable>{loading ? <LoadingState /> : error && !member ? <MessageState message={error} retry={refresh} /> : member ? <ScrollView contentContainerStyle={{ paddingBottom: 55 }}>
    <SectionHeading title={member.name} subtitle={[member.company_name, member.industry].filter(Boolean).join(' · ') || 'Approved B Square member'} />
    <View style={{ paddingHorizontal: 24, gap: 14 }}>
      <Text style={{ fontFamily: 'Ubuntu_500Medium', color: '#234FC8', fontSize: 12 }}>{member.verification_status === 'approved' ? 'MANUALLY APPROVED MEMBER' : 'MEMBER'}</Text>
      {member.headline ? <Text style={{ fontFamily: 'Ubuntu_500Medium', color: '#102758', fontSize: 17 }}>{member.headline}</Text> : null}
      {member.bio ? <Text style={{ fontFamily: 'Ubuntu_400Regular', color: '#61718D', fontSize: 15, lineHeight: 24 }}>{member.bio}</Text> : null}
      {member.city ? <Text style={{ color: '#61718D' }}>City: {member.city}</Text> : null}
      {member.email ? <Text style={{ color: '#61718D' }}>Email: {member.email}</Text> : null}
      {member.phone ? <Text style={{ color: '#61718D' }}>Phone: {member.phone}</Text> : null}
      {error ? <Text style={{ color: '#A52D38' }}>{error}</Text> : null}
      {member.connection_status === 'connected' ? <PrimaryButton label="Message" onPress={() => router.push(`/chat/${id}`)} /> : <PrimaryButton label={member.connection_status === 'request_sent' ? 'Request pending' : member.connection_status === 'request_received' ? 'See requests' : busy ? 'Sending...' : 'Request connection'} disabled={busy || member.connection_status === 'request_sent'} onPress={() => member.connection_status === 'request_received' ? router.push('/(tabs)/requests') : action('connect')} />}
      <ScalePressable onPress={() => setShowReport(old => !old)} style={{ marginTop: 28, paddingVertical: 10 }}><Text style={{ color: '#526789', fontFamily: 'Ubuntu_500Medium' }}>Report member</Text></ScalePressable>
      {showReport ? <View style={{ gap: 12 }}><TextInput multiline value={reason} onChangeText={setReason} placeholder="Reason for your report (required)" maxLength={500} style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#DDE5F3', borderRadius: 12, padding: 14, minHeight: 95, textAlignVertical: 'top', color: '#102758' }} /><PrimaryButton label="Submit report" disabled={busy || reason.trim().length < 5} onPress={() => action('report')} /></View> : null}
      <ScalePressable onPress={confirmBlock} style={{ paddingVertical: 12 }}><Text style={{ color: '#A52D38', fontFamily: 'Ubuntu_500Medium' }}>Block member</Text></ScalePressable>
    </View>
  </ScrollView> : <MessageState message="Profile unavailable" />}</View>;
}
