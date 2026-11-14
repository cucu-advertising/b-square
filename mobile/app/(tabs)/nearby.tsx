import { useThemeColors } from '../../lib/theme';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { api, Member } from '../../lib/api';
import { MessageState, LoadingState } from '../../components/ScreenStates';
import { ScalePressable } from '../../components/AnimatedUI';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useSession } from '../../lib/session';

export default function NearbyScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const selfId = useSession(s => s.user?.id);
  const [members, setMembers] = useState<Member[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const refresh = useCallback(async () => {
    setLoading(true); setError(''); setActionError('');
    try {
      const result = await api.nearby();
      setMembers(result.users.filter(member => member.id !== selfId));
      setIndex(0);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load members'); }
    finally { setLoading(false); }
  }, [selfId]);
  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));

  const member = members[index];
  const nextMember = members[index + 1];
  const remaining = Math.max(0, members.length - index);
  const description = useMemo(() => {
    if (!member) return '';
    return member.headline || member.bio || [member.industry, member.role_title].filter(Boolean).join(' · ') || 'Explore this member’s professional profile and business.';
  }, [member]);
  const pass = () => { setActionError(''); setIndex(i => i + 1); };
  const connect = async () => {
    if (!member || busy) return;
    setBusy(true); setActionError('');
    try { await api.connect(member.id); setIndex(i => i + 1); }
    catch (e) { setActionError(e instanceof Error ? e.message : 'Unable to send connection request'); }
    finally { setBusy(false); }
  };

  return <View style={{ flex: 1, backgroundColor: colors.void }}>
    <View style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 }}>
      <Text style={{ fontFamily: 'Ubuntu_500Medium', color: colors.accent, fontSize: 12, letterSpacing: 2 }}>B SQUARE / DISCOVER</Text>
      <Text style={{ fontFamily: 'Ubuntu_700Bold', color: colors.text, fontSize: 34, marginTop: 8 }}>Good business begins here.</Text>
      <Text style={{ fontFamily: 'Ubuntu_400Regular', color: colors.textDim, fontSize: 14, marginTop: 8 }}>Considered connections, one introduction at a time.</Text>
    </View>
    {loading ? <LoadingState /> : error ? <MessageState message={error} retry={refresh} /> : !member ? (
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 30, alignItems: 'center' }}>
        <Text style={{ fontFamily: 'Ubuntu_700Bold', fontSize: 26, textAlign: 'center', color: colors.text }}>You're all caught up.</Text>
        <Text style={{ fontFamily: 'Ubuntu_400Regular', color: colors.textDim, textAlign: 'center', lineHeight: 23, marginTop: 12, marginBottom: 25 }}>You've explored the available members. New connections will appear here as the community grows.</Text>
        <PrimaryButton label="Explore again" onPress={refresh} />
      </View>
    ) : <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingHorizontal: 5 }}>
        <Text style={{ color: colors.textDim, fontFamily: 'Ubuntu_500Medium', fontSize: 13 }}>{remaining} {remaining === 1 ? 'member' : 'members'} to discover</Text>
        <Text style={{ color: colors.accent, fontFamily: 'Ubuntu_500Medium', fontSize: 13 }}>B Square network</Text>
      </View>
      <View style={{ flex: 1, minHeight: 415, marginBottom: 12, paddingBottom: 10 }}>
        {nextMember ? <View style={{ position: 'absolute', top: 12, left: 12, right: 12, bottom: 0, borderRadius: 30, backgroundColor: colors.voidAlt, borderWidth: 1, borderColor: colors.glassBorder }} /> : null}
        <View style={{ flex: 1, borderRadius: 30, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.glassBorder }}>
          <LinearGradient colors={[colors.heroA, colors.heroB]} style={{ paddingHorizontal: 27, paddingTop: 27, paddingBottom: 34, minHeight: 195, justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: colors.textDim, fontFamily: 'Ubuntu_500Medium', fontSize: 12, letterSpacing: 1.2 }}>MEET THE NETWORK</Text>
              <Text style={{ color: colors.text, fontFamily: 'Ubuntu_500Medium', fontSize: 12 }}>0{index + 1}</Text>
            </View>
            <View>
              <Text numberOfLines={2} style={{ fontFamily: 'Ubuntu_700Bold', color: colors.text, fontSize: 31, lineHeight: 36, marginTop: 24 }}>{member.name}</Text>
              <Text style={{ fontFamily: 'Ubuntu_400Regular', color: colors.textDim, fontSize: 16, marginTop: 7 }}>{member.company_name || 'B Square member'}</Text>
            </View>
          </LinearGradient>
          <View style={{ padding: 26, flex: 1 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginBottom: 24 }}>
              <View style={{ backgroundColor: colors.voidAlt, borderRadius: 20, paddingHorizontal: 13, paddingVertical: 8 }}><Text style={{ color: colors.accent, fontFamily: 'Ubuntu_500Medium', fontSize: 12 }}>Verified member</Text></View>
              {member.city ? <View style={{ backgroundColor: colors.voidAlt, borderRadius: 20, paddingHorizontal: 13, paddingVertical: 8 }}><Text style={{ color: colors.textDim, fontFamily: 'Ubuntu_500Medium', fontSize: 12 }}>{member.distance_km != null ? `${member.distance_km} km away` : member.city}</Text></View> : null}
            </View>
            <Text style={{ color: colors.textFaint, fontFamily: 'Ubuntu_500Medium', fontSize: 11, letterSpacing: 1.5, marginBottom: 12 }}>ABOUT</Text>
            <Text numberOfLines={5} style={{ fontFamily: 'Ubuntu_400Regular', fontSize: 17, lineHeight: 27, color: colors.text }}>{description}</Text>
            <ScalePressable accessibilityRole="button" onPress={() => router.push(`/profile/${member.id}`)} style={{ marginTop: 'auto', paddingTop: 28, paddingBottom: 4 }}>
              <Text style={{ color: colors.accent, fontFamily: 'Ubuntu_500Medium', fontSize: 15 }}>View full profile  →</Text>
            </ScalePressable>
          </View>
        </View>
      </View>
      {actionError ? <Text style={{ color: '#A04440', paddingVertical: 8, fontSize: 13 }}>{actionError}</Text> : null}
      <View style={{ flexDirection: 'row', gap: 12, paddingTop: 10 }}>
        <ScalePressable accessibilityRole="button" onPress={pass} disabled={busy} style={{ flex: 1, borderWidth: 1.5, borderColor: colors.glassBorder, borderRadius: 100, paddingVertical: 19, alignItems: 'center', backgroundColor: colors.text }}>
          <Text style={{ color: colors.text, fontFamily: 'Ubuntu_700Bold', fontSize: 16 }}>Pass</Text>
        </ScalePressable>
        <View style={{ flex: 1.5 }}><PrimaryButton label={busy ? 'Sending...' : 'Connect'} disabled={busy || member.connection_status === 'request_sent'} onPress={connect} /></View>
      </View>
      <Text style={{ textAlign: 'center', color: colors.textFaint, fontFamily: 'Ubuntu_400Regular', fontSize: 12, paddingTop: 15 }}>Pass to see the next profile · Connect to send a request</Text>
    </ScrollView>}
  </View>;
}
