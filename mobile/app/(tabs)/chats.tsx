import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { MessageCircle } from 'lucide-react-native';
import { api, Conversation } from '../../lib/api';
import { useThemeColors } from '../../lib/theme';
import { Avatar } from '../../components/BrandUI';
import { ScalePressable } from '../../components/AnimatedUI';
import { SectionHeading, LoadingState, MessageState } from '../../components/ScreenStates';

export default function ChatsScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const [chats, setChats] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try { const result = await api.conversations(); setChats(result.conversations); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to load messages'); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));
  return <View style={{ flex: 1, backgroundColor: c.void }}>
    <SectionHeading title="Messages." subtitle="Good conversations lead to good business." />
    {loading ? <LoadingState /> : error ? <MessageState message={error} retry={refresh} /> : !chats.length ?
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 32, alignItems: 'center' }}>
        <MessageCircle size={42} color={c.accent} strokeWidth={1.5} />
        <Text style={{ fontFamily: 'Ubuntu_700Bold', color: c.text, fontSize: 26, textAlign: 'center', marginTop: 26 }}>The conversation starts here.</Text>
        <Text style={{ color: c.textDim, fontFamily: 'Ubuntu_400Regular', fontSize: 15, textAlign: 'center', lineHeight: 24, marginTop: 13 }}>Once you connect with a member, your messages will appear here.</Text>
      </View> :
      <ScrollView contentContainerStyle={{ paddingHorizontal: 21, paddingBottom: 40 }}>
        {chats.map(chat => <ScalePressable key={chat.other_id} accessibilityRole="button" onPress={() => router.push(`/chat/${chat.other_id}`)} style={{ flexDirection: 'row', gap: 14, alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: c.glassBorder }}>
          <Avatar name={chat.other_name} size={55} />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <Text numberOfLines={1} style={{ flex: 1, fontFamily: 'Ubuntu_700Bold', color: c.text, fontSize: 16 }}>{chat.other_name}</Text>
              {Number(chat.unread_count) > 0 ? <View style={{ minWidth: 22, height: 22, backgroundColor: c.accent, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: c.onAccent, fontFamily: 'Ubuntu_700Bold', fontSize: 12 }}>{chat.unread_count}</Text></View> : null}
            </View>
            <Text numberOfLines={1} style={{ color: c.textDim, fontFamily: 'Ubuntu_400Regular', fontSize: 13, marginTop: 5 }}>{chat.last_message || 'Say hello'}</Text>
          </View>
        </ScalePressable>)}
      </ScrollView>}
  </View>;
}
