import { useCallback, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Bookmark, ChevronRight, MapPin, Search, ShieldCheck, X } from 'lucide-react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { api, Member } from '../../lib/api';
import { useThemeColors } from '../../lib/theme';
import { useSession } from '../../lib/session';
import { Avatar, BrandMark, Eyebrow } from '../../components/BrandUI';
import { ScalePressable } from '../../components/AnimatedUI';
import { PrimaryButton } from '../../components/PrimaryButton';
import { LoadingState, MessageState } from '../../components/ScreenStates';

type Filter = 'For you' | 'Nearby';

export default function NearbyScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const selfId = useSession(s => s.user?.id);
  const [members, setMembers] = useState<Member[]>([]);
  const [filter, setFilter] = useState<Filter>('For you');
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const refresh = useCallback(async () => {
    setLoading(true); setError(''); setActionError('');
    try {
      const result = await api.nearby();
      setMembers(result.users.filter(m => m.id !== selfId));
      setIndex(0);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load members'); }
    finally { setLoading(false); }
  }, [selfId]);
  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));
  const ordered = useMemo(() => filter === 'Nearby' ? [...members].sort((a, b) =>
    (a.distance_km ?? Number.POSITIVE_INFINITY) - (b.distance_km ?? Number.POSITIVE_INFINITY)) : members, [members, filter]);
  const member = ordered[index];
  const remaining = Math.max(0, ordered.length - index);
  const headline = member ? member.headline || member.role_title || member.industry || 'Business owner' : '';
  const description = member ? member.bio || 'Explore this member’s business and discover where your work intersects.' : '';
  const pass = () => { setActionError(''); setIndex(i => i + 1); };
  const connect = async () => {
    if (!member || busy) return;
    setBusy(true); setActionError('');
    try { await api.connect(member.id); setIndex(i => i + 1); }
    catch (e) { setActionError(e instanceof Error ? e.message : 'Could not send your request'); }
    finally { setBusy(false); }
  };

  return <View style={{ flex: 1, backgroundColor: c.void }}>
    <View style={{ paddingHorizontal: 23, paddingTop: 22, paddingBottom: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <BrandMark size={27} />
        <Text style={{ fontFamily: 'Ubuntu_700Bold', fontSize: 25, letterSpacing: -0.6, color: c.text, flex: 1 }}>Discover</Text>
        <ScalePressable accessibilityRole="button" accessibilityLabel="Your network" onPress={() => router.push('/(tabs)/requests')} style={{ padding: 8 }}>
          <Search color={c.accent} size={21} strokeWidth={1.8} />
        </ScalePressable>
      </View>
      <Text style={{ fontFamily: 'Ubuntu_400Regular', color: c.textDim, fontSize: 13, marginTop: 12 }}>The right people. For you.</Text>
      <View style={{ flexDirection: 'row', gap: 9, marginTop: 18, marginBottom: 12 }}>
        {(['For you', 'Nearby'] as Filter[]).map(item => <ScalePressable key={item} onPress={() => { setFilter(item); setIndex(0); }}
          style={{ backgroundColor: filter === item ? c.accent : c.surface, borderWidth: 1, borderColor: filter === item ? c.accent : c.glassBorder, borderRadius: 30, paddingHorizontal: 18, paddingVertical: 9 }}>
          <Text style={{ fontFamily: 'Ubuntu_700Bold', fontSize: 12, color: filter === item ? c.onAccent : c.textDim }}>{item}</Text>
        </ScalePressable>)}
      </View>
    </View>
    {loading ? <LoadingState /> : error ? <MessageState message={error} retry={refresh} /> : !member ? <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 30 }}>
      <Text style={{ fontFamily: 'Ubuntu_700Bold', color: c.text, fontSize: 31, lineHeight: 38, textAlign: 'center' }}>Your next hello is on its way.</Text>
      <Text style={{ fontFamily: 'Ubuntu_400Regular', color: c.textDim, fontSize: 16, lineHeight: 24, textAlign: 'center', marginTop: 16, marginBottom: 30 }}>You've explored the available members. Check back as your circle grows.</Text>
      <PrimaryButton label="Explore again" onPress={refresh} />
    </View> : <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 19, paddingBottom: 20 }}>
      <View style={{ borderColor: c.glassBorder, borderWidth: 1, backgroundColor: c.surface, borderRadius: 22, padding: 21, minHeight: 460, marginTop: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Eyebrow>{String(index + 1).padStart(2, '0')} / CURATED MATCH</Eyebrow>
          <Bookmark size={18} strokeWidth={1.5} color={c.accent} />
        </View>
        <View style={{ alignItems: 'center', paddingTop: 27, paddingBottom: 23 }}>
          <Avatar name={member.name} size={116} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
          <Text numberOfLines={1} style={{ flex: 1, fontFamily: 'Ubuntu_700Bold', color: c.text, fontSize: 23, letterSpacing: -0.4 }}>{member.name}</Text>
          {member.verification_status === 'approved' ? <ShieldCheck color={c.accent} size={18} /> : null}
        </View>
        <Text numberOfLines={2} style={{ color: c.textDim, fontFamily: 'Ubuntu_400Regular', fontSize: 13, marginTop: 6 }}>{headline}{member.company_name ? ' · ' + member.company_name : ''}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 19 }}>
          <MapPin size={14} color={c.accent} />
          <Text style={{ color: c.textDim, fontFamily: 'Ubuntu_400Regular', fontSize: 12 }}>
            {member.city || 'Location not listed'}{member.distance_km != null ? ' · ' + member.distance_km + ' km away' : ''}
          </Text>
        </View>
        <View style={{ height: 1, backgroundColor: c.glassBorder, marginBottom: 16 }} />
        <Eyebrow>ABOUT THIS MEMBER</Eyebrow>
        <Text numberOfLines={4} style={{ color: c.text, fontFamily: 'Ubuntu_400Regular', fontSize: 15, lineHeight: 23, marginTop: 11 }}>{description}</Text>
        <ScalePressable onPress={() => router.push(`/profile/${member.id}`)} style={{ marginTop: 'auto', paddingTop: 18, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Text style={{ color: c.accent, fontFamily: 'Ubuntu_700Bold', fontSize: 13 }}>View founder profile</Text>
          <ChevronRight size={17} color={c.accent} />
        </ScalePressable>
      </View>
      {actionError ? <Text style={{ color: '#FFB6B6', marginVertical: 12 }}>{actionError}</Text> : null}
      <View style={{ flexDirection: 'row', gap: 9, marginTop: 14, alignItems: 'stretch' }}>
        <ScalePressable disabled={busy} accessibilityRole="button" accessibilityLabel="Pass on this member" onPress={pass} style={{ flex: 1, minHeight: 54, borderColor: c.glassBorder, borderWidth: 1, borderRadius: 13, backgroundColor: c.voidAlt, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 7 }}>
          <X color={c.accent} size={18} /><Text style={{ color: c.text, fontFamily: 'Ubuntu_700Bold' }}>Pass</Text>
        </ScalePressable>
        <View style={{ flex: 1.55 }}><PrimaryButton label={busy ? 'Sending...' : member.connection_status === 'request_sent' ? 'Pending' : 'Connect'} disabled={busy || member.connection_status === 'request_sent'} onPress={connect} /></View>
      </View>
      <Text style={{ color: c.textFaint, fontFamily: 'Ubuntu_400Regular', fontSize: 12, textAlign: 'center', marginTop: 15 }}>{remaining} {remaining === 1 ? 'person' : 'people'} left in this view</Text>
    </ScrollView>}
  </View>;
}
