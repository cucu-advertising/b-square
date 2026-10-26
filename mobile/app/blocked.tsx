import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { api, Member } from '../lib/api';
import { SectionHeading, LoadingState, MessageState } from '../components/ScreenStates';
import { ScalePressable } from '../components/AnimatedUI';
export default function BlockedScreen() {
  const router = useRouter(); const [items, setItems] = useState<Member[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const refresh = useCallback(async () => { setLoading(true); try { const d = await api.blocks(); setItems(d.blocked); setError(''); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load blocked members'); } finally { setLoading(false); } }, []);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));
  const unblock = async (id: string) => { try { await api.unblock(id); await refresh(); } catch (e) { setError(e instanceof Error ? e.message : 'Could not unblock member'); } };
  return <View style={{ flex: 1, backgroundColor: '#F8FAFE' }}><ScalePressable onPress={() => router.back()} style={{ paddingTop: 35, paddingHorizontal: 24 }}><Text style={{ color: '#234FC8', fontFamily: 'Ubuntu_500Medium' }}>← Back</Text></ScalePressable><SectionHeading title="Blocked members" subtitle="Manage who can contact you" />{error ? <Text style={{ padding: 20, color: '#A52D38' }}>{error}</Text> : null}{loading ? <LoadingState /> : !items.length ? <MessageState message="You haven't blocked anyone." /> : <ScrollView contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}>{items.map(member => <View key={member.id} style={{ backgroundColor: 'white', borderColor: '#DDE5F3', borderWidth: 1, padding: 17, borderRadius: 14, gap: 8 }}><Text style={{ color: '#102758', fontFamily: 'Ubuntu_700Bold', fontSize: 17 }}>{member.name}</Text><ScalePressable onPress={() => unblock(member.id)} style={{ paddingVertical: 12 }}><Text style={{ color: '#234FC8' }}>Unblock</Text></ScalePressable></View>)}</ScrollView>}</View>;
}
