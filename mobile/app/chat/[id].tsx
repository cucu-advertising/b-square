import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useFocusEffect, useRouter } from 'expo-router';
import { api, ChatMessage } from '../../lib/api';
import { useSession } from '../../lib/session';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScalePressable } from '../../components/AnimatedUI';
import { LoadingState, MessageState } from '../../components/ScreenStates';
export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter(); const self = useSession(s => s.user);
  const [messages, setMessages] = useState<ChatMessage[]>([]); const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true); const [sending, setSending] = useState(false); const [error, setError] = useState('');
  const refresh = useCallback(async () => { if (!id) return; setError(''); try { const d = await api.messages(id); setMessages(d.messages); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load conversation'); } finally { setLoading(false); } }, [id]);
  useFocusEffect(useCallback(() => { refresh(); const timer = setInterval(refresh, 8000); return () => clearInterval(timer); }, [refresh]));
  const send = async () => { const content = draft.trim(); if (!content || !id || sending) return; setSending(true); try { await api.sendMessage(id, content); setDraft(''); await refresh(); } catch (e) { setError(e instanceof Error ? e.message : 'Message not sent'); } finally { setSending(false); } };
  return <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#F8FAFE' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScalePressable onPress={() => router.back()} style={{ paddingHorizontal: 22, paddingTop: 35, paddingBottom: 16 }}><Text style={{ color: '#234FC8', fontFamily: 'Ubuntu_500Medium' }}>← Back to chats</Text></ScalePressable>{loading ? <LoadingState /> : error && !messages.length ? <MessageState message={error} retry={refresh} /> : <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, gap: 11 }}>{messages.map(message => <View key={message.id} style={{ alignSelf: message.sender_id === self?.id ? 'flex-end' : 'flex-start', backgroundColor: message.sender_id === self?.id ? '#234FC8' : '#E8EEF8', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, maxWidth: '86%' }}><Text style={{ fontFamily: 'Ubuntu_400Regular', color: message.sender_id === self?.id ? 'white' : '#102758', fontSize: 15, lineHeight: 22 }}>{message.content}</Text></View>)}</ScrollView>}{error && messages.length ? <Text style={{ color: '#A52D38', paddingHorizontal: 20 }}>{error}</Text> : null}<View style={{ padding: 15, backgroundColor: 'white', borderTopWidth: 1, borderColor: '#E1E8F4' }}><TextInput value={draft} onChangeText={setDraft} placeholder="Write a message..." multiline maxLength={2000} style={{ borderWidth: 1, borderColor: '#DDE5F3', borderRadius: 13, minHeight: 46, maxHeight: 105, padding: 12, color: '#102758', fontFamily: 'Ubuntu_400Regular', marginBottom: 10 }} /><PrimaryButton label={sending ? 'Sending...' : 'Send'} onPress={send} disabled={!draft.trim() || sending} /></View></KeyboardAvoidingView>;
}
