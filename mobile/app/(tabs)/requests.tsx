import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Check, X, ArrowUpRight } from 'lucide-react-native';
import { api, RequestItem, Member } from '../../lib/api';
import { useThemeColors } from '../../lib/theme';
import { Avatar, Eyebrow } from '../../components/BrandUI';
import { ScalePressable } from '../../components/AnimatedUI';
import { LoadingState, MessageState, SectionHeading } from '../../components/ScreenStates';

type Panel = 'Connections' | 'Received' | 'Sent';

export default function RequestsScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const [panel, setPanel] = useState<Panel>('Connections');
  const [connections, setConnections] = useState<Member[]>([]);
  const [received, setReceived] = useState<RequestItem[]>([]);
  const [sent, setSent] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [linked, incoming, outgoing] = await Promise.all([api.connections(), api.received(), api.sent()]);
      setConnections(linked.users);
      setReceived(incoming.requests);
      setSent(outgoing.requests);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load your network'); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));
  const act = async (id: string, accept: boolean) => {
    if (busy) return;
    setBusy(id); setError('');
    try { if (accept) await api.accept(id); else await api.decline(id); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to update the request'); }
    finally { setBusy(null); }
  };
  const shown = panel === 'Received' ? received : sent;

  return <View style={{ flex: 1, backgroundColor: c.void }}>
    <SectionHeading title="Your network." subtitle="Build connections that go somewhere." />
    <View style={{ flexDirection: 'row', paddingHorizontal: 23, gap: 10, paddingBottom: 18 }}>
      {(['Connections', 'Received', 'Sent'] as Panel[]).map(tab => <ScalePressable key={tab} onPress={() => setPanel(tab)}
        style={{ paddingVertical: 11, paddingHorizontal: 14, borderRadius: 30, borderWidth: 1, borderColor: c.glassBorder, backgroundColor: panel === tab ? c.accent : c.surface }}>
        <Text style={{ color: panel === tab ? c.onAccent : c.textDim, fontFamily: 'Ubuntu_700Bold', fontSize: 11 }}>{tab}{tab === 'Received' && received.length ? ' · ' + received.length : ''}</Text>
      </ScalePressable>)}
    </View>
    {loading ? <LoadingState /> : error ? <MessageState message={error} retry={refresh} /> : panel === 'Connections' && connections.length ? (
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingBottom: 45 }}>
        {connections.map(member => <ScalePressable key={member.id} onPress={() => router.push(`/profile/${member.id}`)}
          style={{ padding: 18, borderRadius: 19, backgroundColor: c.surface, borderWidth: 1, borderColor: c.glassBorder, flexDirection: 'row', alignItems: 'center', gap: 13 }}>
          <Avatar name={member.name} size={57} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: c.text, fontFamily: 'Ubuntu_700Bold', fontSize: 17 }}>{member.name}</Text>
            <Text numberOfLines={2} style={{ color: c.textDim, fontFamily: 'Ubuntu_400Regular', fontSize: 12, marginTop: 5 }}>{member.company_name || member.headline || member.city || 'Connected Bsquare member'}</Text>
          </View>
          <ArrowUpRight color={c.accent} size={19} />
        </ScalePressable>)}
      </ScrollView>
    ) : panel === 'Connections' || !shown.length ?
      <View style={{ flex: 1, paddingHorizontal: 28, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontFamily: 'Ubuntu_700Bold', color: c.text, fontSize: 27, textAlign: 'center' }}>Every connection starts with a hello.</Text>
        <Text style={{ color: c.textDim, fontFamily: 'Ubuntu_400Regular', fontSize: 15, lineHeight: 24, textAlign: 'center', marginTop: 17 }}>{panel === 'Connections' ? 'Your accepted connections will appear here.' : panel === 'Received' ? 'New connection requests will appear here.' : 'Requests you send will appear here.'}</Text>
        <ScalePressable onPress={() => router.replace('/(tabs)/nearby')} style={{ marginTop: 25, borderWidth: 1, borderColor: c.accent, paddingVertical: 13, paddingHorizontal: 21, borderRadius: 12 }}>
          <Text style={{ fontFamily: 'Ubuntu_700Bold', color: c.accent }}>Discover members</Text>
        </ScalePressable>
      </View> :
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingBottom: 36 }}>
        {shown.map(request => <View key={request.request_id} style={{ padding: 17, backgroundColor: c.surface, borderWidth: 1, borderColor: c.glassBorder, borderRadius: 20 }}>
          <View style={{ flexDirection: 'row', gap: 13, alignItems: 'center' }}>
            <Avatar name={request.name} size={59} />
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={{ color: c.text, fontFamily: 'Ubuntu_700Bold', fontSize: 17 }}>{request.name}</Text>
              <Text numberOfLines={2} style={{ color: c.textDim, fontFamily: 'Ubuntu_400Regular', fontSize: 12, lineHeight: 19, marginTop: 3 }}>{request.company_name || request.industry || request.city || 'B Square member'}</Text>
            </View>
          </View>
          <View style={{ paddingTop: 19 }}><Eyebrow>{panel === 'Received' ? 'WANTS TO CONNECT' : 'REQUEST SENT'}</Eyebrow></View>
          {panel === 'Received' ? <View style={{ flexDirection: 'row', gap: 10, marginTop: 15 }}>
            <ScalePressable disabled={busy !== null} onPress={() => void act(request.request_id, false)} style={{ flex: 1, borderWidth: 1, borderColor: c.glassBorder, borderRadius: 12, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 7 }}>
              <X size={16} color={c.accent} /><Text style={{ fontFamily: 'Ubuntu_700Bold', color: c.text }}>Decline</Text>
            </ScalePressable>
            <ScalePressable disabled={busy !== null} onPress={() => void act(request.request_id, true)} style={{ flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: c.accent, flexDirection: 'row', justifyContent: 'center', gap: 7 }}>
              <Check size={16} color={c.onAccent} /><Text style={{ fontFamily: 'Ubuntu_700Bold', color: c.onAccent }}>Accept</Text>
            </ScalePressable>
          </View> : <Text style={{ color: c.textDim, fontFamily: 'Ubuntu_400Regular', fontSize: 13, marginTop: 12 }}>Awaiting a response</Text>}
        </View>)}
      </ScrollView>}
  </View>;
}
