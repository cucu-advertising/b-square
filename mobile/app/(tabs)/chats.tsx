import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { api, Conversation } from '../../lib/api';
import { SectionHeading, LoadingState, MessageState } from '../../components/ScreenStates';
import { ScalePressable } from '../../components/AnimatedUI';
export default function ChatsScreen() {
  const router = useRouter();
  const [chats, setChats] = useState<Conversation[]>([]);
  const [error, setError] = useState(''); const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => { setLoading(true); setError(''); try { const d = await api.conversations(); setChats(d.conversations); } catch(e) { setError(e instanceof Error ? e.message : 'Unable to load chats'); } finally { setLoading(false); } }, []);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));
  return <View style={{ flex: 1, backgroundColor: '#F8FAFE' }}><SectionHeading title="Chats" subtitle="Your conversations" />{loading ? <LoadingState /> : error ? <MessageState message={error} retry={refresh} /> : !chats.length ? <MessageState message="No conversations yet. Connect with a verified member to start a conversation." /> : <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>{chats.map(chat => <ScalePressable key={chat.other_id} onPress={() => router.push(`/chat/${chat.other_id}`)} style={{ paddingVertical: 21, borderBottomWidth: 1, borderColor: '#E1E8F4' }}><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ fontFamily: 'Ubuntu_700Bold', color: '#102758', fontSize: 17 }}>{chat.other_name}</Text>{Number(chat.unread_count) > 0 ? <Text style={{ color: '#234FC8', fontFamily: 'Ubuntu_700Bold' }}>{chat.unread_count} new</Text> : null}</View><Text numberOfLines={1} style={{ marginTop: 5, color: '#62728C', fontFamily: 'Ubuntu_400Regular', fontSize: 14 }}>{chat.last_message || 'Start a conversation'}</Text></ScalePressable>)}</ScrollView>}</View>;
}
