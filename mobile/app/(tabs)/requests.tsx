import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { api, RequestItem } from '../../lib/api';
import { SectionHeading, LoadingState, MessageState } from '../../components/ScreenStates';
import { ScalePressable } from '../../components/AnimatedUI';
export default function RequestsScreen() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const refresh = useCallback(async () => { setLoading(true); setError(''); try { const x = await api.received(); setRequests(x.requests); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load requests'); } finally { setLoading(false); } }, []);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));
  const act = async (requestId: string, accept: boolean) => { setBusy(requestId); setError(''); try { if (accept) await api.accept(requestId); else await api.decline(requestId); await refresh(); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to update request'); } finally { setBusy(null); } };
  return <View style={{ flex: 1, backgroundColor: '#F8FAFE' }}><SectionHeading title="Requests" subtitle="People who want to connect" />{error ? <Text style={{ color: '#A52D38', marginHorizontal: 24, marginBottom: 12 }}>{error}</Text> : null}{loading ? <LoadingState /> : !requests.length ? <MessageState message="You're all caught up. New connection requests will appear here." /> : <ScrollView contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingBottom: 50 }}>{requests.map(request => <View key={request.request_id} style={{ backgroundColor: 'white', borderColor: '#E1E8F4', borderWidth: 1, borderRadius: 16, padding: 18, gap: 9 }}><Text style={{ fontFamily: 'Ubuntu_700Bold', fontSize: 18, color: '#102758' }}>{request.name}</Text><Text style={{ fontFamily: 'Ubuntu_400Regular', color: '#62728C' }}>{request.company_name || request.industry || request.city || 'Member'}</Text><View style={{ flexDirection: 'row', gap: 10, paddingTop: 8 }}><ScalePressable disabled={busy !== null} onPress={() => act(request.request_id, true)} style={{ backgroundColor: '#234FC8', borderRadius: 10, paddingHorizontal: 23, paddingVertical: 12 }}><Text style={{ color: 'white', fontFamily: 'Ubuntu_500Medium' }}>Accept</Text></ScalePressable><ScalePressable disabled={busy !== null} onPress={() => act(request.request_id, false)} style={{ backgroundColor: '#E9EFF8', borderRadius: 10, paddingHorizontal: 23, paddingVertical: 12 }}><Text style={{ color: '#102758', fontFamily: 'Ubuntu_500Medium' }}>Decline</Text></ScalePressable></View></View>)}</ScrollView>}</View>;
}
