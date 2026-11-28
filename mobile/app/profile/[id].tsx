import { useCallback, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MapPin, ShieldCheck, AlertTriangle } from 'lucide-react-native';
import { api, Member } from '../../lib/api';
import { useThemeColors } from '../../lib/theme';
import { Avatar, Eyebrow, VerifiedPill } from '../../components/BrandUI';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScalePressable } from '../../components/AnimatedUI';
import { LoadingState, MessageState } from '../../components/ScreenStates';

export default function MemberScreen() {
  const c = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [reason, setReason] = useState('');
  const [showReport, setShowReport] = useState(false);
  const refresh = useCallback(async () => {
    if (!id) return;
    setLoading(true); setError('');
    try { const result = await api.member(id); setMember(result.user); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to load profile'); }
    finally { setLoading(false); }
  }, [id]);
  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));
  const action = async (what: 'connect' | 'block' | 'report') => {
    if (!id || busy) return;
    setBusy(true); setError('');
    try {
      if (what === 'connect') { await api.connect(id); await refresh(); }
      if (what === 'block') { await api.block(id); router.replace('/(tabs)/nearby'); }
      if (what === 'report') {
        if (reason.trim().length < 5) { setError('Please add at least five characters.'); return; }
        await api.report(id, reason.trim());
        setShowReport(false); setReason('');
        Alert.alert('Report submitted', 'The Bsquare team will review your report.');
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to complete action'); }
    finally { setBusy(false); }
  };
  const confirmBlock = () => Alert.alert('Block member?', 'Blocking removes your connection and prevents further contact.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Block', style: 'destructive', onPress: () => void action('block') },
  ]);
  return <View style={{ flex: 1, backgroundColor: c.void }}>
    <ScalePressable accessibilityRole="button" onPress={() => router.back()} style={{ paddingHorizontal: 22, paddingTop: 28, paddingBottom: 18, flexDirection: 'row', alignItems: 'center', gap: 7 }}>
      <ArrowLeft size={19} color={c.accent} /><Text style={{ color: c.text, fontFamily: 'Ubuntu_500Medium' }}>Founder profile</Text>
    </ScalePressable>
    {loading ? <LoadingState /> : error && !member ? <MessageState message={error} retry={refresh} /> : member ?
      <ScrollView contentContainerStyle={{ paddingHorizontal: 23, paddingBottom: 55 }}>
        <View style={{ alignItems: 'center', paddingTop: 16, paddingBottom: 26 }}>
          <Avatar name={member.name} photo={member.profilePhoto} size={124} />
          <Text style={{ fontFamily: 'Ubuntu_700Bold', color: c.text, fontSize: 29, lineHeight: 34, marginTop: 26, textAlign: 'center' }}>{member.name}</Text>
          <Text style={{ fontFamily: 'Ubuntu_400Regular', fontSize: 14, color: c.textDim, lineHeight: 20, textAlign: 'center', marginTop: 9 }}>{member.role_title || member.headline || 'Member'}{member.company_name ? ' · ' + member.company_name : ''}</Text>
          {member.verification_status === 'approved' ? <View style={{ marginTop: 19 }}><VerifiedPill label="Verified founder" /></View> : null}
        </View>
        <View style={{ height: 1, backgroundColor: c.glassBorder, marginBottom: 27 }} />
        <Eyebrow>ABOUT</Eyebrow>
        <Text style={{ color: c.text, fontFamily: 'Ubuntu_400Regular', fontSize: 16, lineHeight: 25, marginTop: 15, marginBottom: 25 }}>{member.bio || member.headline || 'This member has not added a bio yet.'}</Text>
        <View style={{ height: 1, backgroundColor: c.glassBorder, marginBottom: 23 }} />
        {member.city ? <View style={{ flexDirection: 'row', gap: 9, alignItems: 'center', marginBottom: 30 }}>
          <MapPin color={c.accent} size={18} />
          <Text style={{ fontFamily: 'Ubuntu_400Regular', color: c.textDim, fontSize: 14 }}>{member.city}</Text>
        </View> : null}
        {error ? <Text style={{ color: '#FFB6B6', marginBottom: 16 }}>{error}</Text> : null}
        {member.connection_status === 'connected' ?
          <PrimaryButton label="Send a message" onPress={() => router.push(`/chat/${id}`)} /> :
          <PrimaryButton
            label={member.connection_status === 'request_sent' ? 'Request pending' : member.connection_status === 'request_received' ? 'See requests' : busy ? 'Sending...' : 'Connect'}
            disabled={busy || member.connection_status === 'request_sent'}
            onPress={() => member.connection_status === 'request_received' ? router.push('/(tabs)/requests') : void action('connect')} />}
        <View style={{ height: 1, backgroundColor: c.glassBorder, marginTop: 33, marginBottom: 18 }} />
        <ScalePressable accessibilityRole="button" onPress={() => setShowReport(x => !x)} style={{ flexDirection: 'row', gap: 10, paddingVertical: 15, alignItems: 'center' }}>
          <AlertTriangle color={c.textDim} size={16} />
          <Text style={{ color: c.textDim, fontFamily: 'Ubuntu_500Medium' }}>Report this member</Text>
        </ScalePressable>
        {showReport ? <View style={{ gap: 12, marginTop: 6 }}>
          <TextInput value={reason} onChangeText={setReason} accessibilityLabel="Report reason" placeholder="Reason for reporting" placeholderTextColor={c.textFaint} multiline maxLength={500}
            style={{ backgroundColor: c.voidAlt, borderWidth: 1, borderColor: c.glassBorder, padding: 15, minHeight: 96, borderRadius: 13, color: c.text, fontFamily: 'Ubuntu_400Regular', textAlignVertical: 'top' }} />
          <PrimaryButton label="Submit report" disabled={busy || reason.trim().length < 5} onPress={() => void action('report')} />
        </View> : null}
        <ScalePressable accessibilityRole="button" onPress={confirmBlock} style={{ paddingVertical: 17 }}>
          <Text style={{ fontFamily: 'Ubuntu_500Medium', color: '#FFB6B6' }}>Block this member</Text>
        </ScalePressable>
      </ScrollView> : <MessageState message="Profile is not available" />}
  </View>;
}
