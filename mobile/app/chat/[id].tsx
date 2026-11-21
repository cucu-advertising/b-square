import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { ArrowLeft, Send } from 'lucide-react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { api, ChatMessage } from '../../lib/api';
import { useSession } from '../../lib/session';
import { useThemeColors } from '../../lib/theme';
import { ScalePressable } from '../../components/AnimatedUI';
import { LoadingState, MessageState } from '../../components/ScreenStates';

export default function ConversationScreen() {
  const c = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const self = useSession(s => s.user);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    if (!id) return;
    setError('');
    try { const data = await api.messages(id); setMessages(data.messages); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to load conversation'); }
    finally { setLoading(false); }
  }, [id]);
  useFocusEffect(useCallback(() => {
    void refresh();
    const timer = setInterval(() => { void refresh(); }, 8000);
    return () => clearInterval(timer);
  }, [refresh]));
  const send = async () => {
    const content = draft.trim();
    if (!content || !id || sending) return;
    setSending(true);
    try { await api.sendMessage(id, content); setDraft(''); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Message not sent'); }
    finally { setSending(false); }
  };
  return <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.void }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScalePressable onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 22, paddingTop: 31, paddingBottom: 19, gap: 9, borderBottomWidth: 1, borderBottomColor: c.glassBorder }}>
      <ArrowLeft color={c.accent} size={19} />
      <Text style={{ fontFamily: 'Ubuntu_700Bold', color: c.text, fontSize: 17 }}>Conversation</Text>
    </ScalePressable>
    {loading ? <LoadingState /> : error && !messages.length ? <MessageState message={error} retry={refresh} /> :
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 25, gap: 12 }}>
        {messages.map(message => {
          const own = message.sender_id === self?.id;
          return <View key={message.id} style={{ alignSelf: own ? 'flex-end' : 'flex-start', backgroundColor: own ? c.accent : c.surface, maxWidth: '85%', borderRadius: 16, paddingVertical: 13, paddingHorizontal: 16, borderWidth: own ? 0 : 1, borderColor: c.glassBorder }}>
            <Text style={{ color: own ? c.onAccent : c.text, fontFamily: 'Ubuntu_400Regular', fontSize: 15, lineHeight: 23 }}>{message.content}</Text>
          </View>;
        })}
      </ScrollView>}
    {error && messages.length ? <Text style={{ color: '#FFB6B6', fontSize: 12, marginHorizontal: 19, marginBottom: 8 }}>{error}</Text> : null}
    <View style={{ flexDirection: 'row', gap: 11, padding: 15, borderTopColor: c.glassBorder, borderTopWidth: 1, backgroundColor: c.voidAlt, alignItems: 'flex-end' }}>
      <TextInput accessibilityLabel="Message" value={draft} onChangeText={setDraft} placeholder="Write a message..." placeholderTextColor={c.textFaint} multiline maxLength={2000}
        style={{ flex: 1, minHeight: 48, maxHeight: 120, backgroundColor: c.surface, borderWidth: 1, borderColor: c.glassBorder, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 15, fontFamily: 'Ubuntu_400Regular', fontSize: 15, color: c.text }} />
      <ScalePressable accessibilityRole="button" accessibilityLabel={sending ? 'Sending message' : 'Send message'} disabled={sending || !draft.trim()} onPress={send}
        style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: c.accent, opacity: sending || !draft.trim() ? 0.5 : 1 }}>
        <Send size={19} color={c.onAccent} />
      </ScalePressable>
    </View>
  </KeyboardAvoidingView>;
}
