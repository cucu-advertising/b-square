import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { api, Member } from '../../lib/api';
import { SectionHeading, MessageState, LoadingState } from '../../components/ScreenStates';
import { ScalePressable } from '../../components/AnimatedUI';
export default function NearbyScreen() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try { const result = await api.nearby(); setMembers(result.users); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to load members'); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));
  return <View style={{ flex: 1, backgroundColor: '#F8FAFE' }}><SectionHeading title="Discover" subtitle="Verified members in your city" />{loading ? <LoadingState /> : error ? <MessageState message={error} retry={refresh} /> : members.length === 0 ? <MessageState message="No verified members are available in your city yet. Check back as new members are approved." /> : <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 50, gap: 12 }}>
    {members.map(member => <ScalePressable key={member.id} onPress={() => router.push(`/profile/${member.id}`)} style={{ backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#E1E8F4', padding: 19, gap: 7 }}>
      <Text style={{ fontFamily: 'Ubuntu_700Bold', fontSize: 19, color: '#102758' }}>{member.name}</Text>
      <Text style={{ fontFamily: 'Ubuntu_500Medium', fontSize: 14, color: '#62728C' }}>{member.company_name || member.headline || member.industry || 'B Square member'}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 7 }}><Text style={{ fontFamily: 'Ubuntu_500Medium', fontSize: 12, color: '#234FC8' }}>Approved member</Text><Text style={{ fontSize: 12, color: '#62728C' }}>{member.distance_km != null ? `${member.distance_km} km away` : member.city || ''}</Text></View>
    </ScalePressable>)}
  </ScrollView>}</View>;
}
