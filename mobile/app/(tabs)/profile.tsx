import { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, LockKeyhole, LogOut, ShieldCheck, Trash2 } from 'lucide-react-native';
import { useThemeColors } from '../../lib/theme';
import { useSession } from '../../lib/session';
import { api } from '../../lib/api';
import { Avatar, Eyebrow, VerifiedPill } from '../../components/BrandUI';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScalePressable } from '../../components/AnimatedUI';
import { SectionHeading } from '../../components/ScreenStates';

export default function ProfileScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const { user, signOut, updateUser } = useSession();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  useEffect(() => { setName(user?.name || ''); setBio(user?.bio || ''); }, [user?.id]);
  const save = async () => {
    if (saving) return;
    setSaving(true); setError('');
    try {
      const data = await api.updateMe({ bio, firstName: name.trim().split(/\s+/)[0] || '', lastName: name.trim().split(/\s+/).slice(1).join(' ') });
      updateUser(data.user);
      Alert.alert('Saved', 'Your Bsquare profile has been updated.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to update profile'); }
    finally { setSaving(false); }
  };
  const logout = async () => { await signOut(); router.replace('/login'); };
  const deleteAccount = () => Alert.alert(
    'Permanently delete your account?',
    'This permanently deletes your membership and associated account information. This cannot be undone.',
    [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete permanently', style: 'destructive', onPress: async () => {
      try { await api.deleteAccount(deletePassword); await signOut(); router.replace('/login'); }
      catch (e) { setError(e instanceof Error ? e.message : 'Deletion failed. Please try again.'); }
    }}]
  );
  const fieldStyle = { borderWidth: 1, borderColor: c.glassBorder, borderRadius: 13, backgroundColor: '#081F5B', padding: 16, fontFamily: 'Ubuntu_400Regular' as const, color: c.text, fontSize: 15 };

  return <ScrollView style={{ flex: 1, backgroundColor: c.void }} contentContainerStyle={{ paddingBottom: 55 }} keyboardShouldPersistTaps="handled">
    <SectionHeading title="My profile." subtitle="Your identity in the Bsquare community." />
    <View style={{ marginHorizontal: 21, backgroundColor: c.surface, borderWidth: 1, borderColor: c.glassBorder, borderRadius: 20, padding: 23, marginBottom: 25, alignItems: 'center' }}>
      <Avatar name={user?.name || 'B Square'} size={99} />
      <Text style={{ fontFamily: 'Ubuntu_700Bold', color: c.text, fontSize: 24, marginTop: 17 }}>{user?.name || 'B Square member'}</Text>
      <Text style={{ fontFamily: 'Ubuntu_400Regular', color: c.textDim, fontSize: 13, marginTop: 7, textAlign: 'center' }}>{user?.company_name || user?.industry || 'Your business'}</Text>
      {user?.verification_status === 'approved' ? <View style={{ marginTop: 17 }}><VerifiedPill label="Verified member" /></View> : null}
    </View>
    <View style={{ paddingHorizontal: 22 }}>
      <Eyebrow>PROFILE DETAILS</Eyebrow>
      <Text style={{ color: c.textDim, fontFamily: 'Ubuntu_500Medium', marginTop: 19, marginBottom: 8 }}>Your full name</Text>
      <TextInput accessibilityLabel="Your full name" value={name} onChangeText={setName} style={fieldStyle} placeholderTextColor={c.textFaint} />
      <Text style={{ color: c.textDim, fontFamily: 'Ubuntu_500Medium', marginTop: 17, marginBottom: 8 }}>About your business</Text>
      <TextInput accessibilityLabel="About your business" value={bio} onChangeText={setBio} multiline maxLength={1500} placeholder="Introduce your business" placeholderTextColor={c.textFaint} style={[fieldStyle, { minHeight: 126, textAlignVertical: 'top' }]} />
      <Text style={{ color: c.textFaint, fontFamily: 'Ubuntu_400Regular', fontSize: 12, marginTop: 11, marginBottom: 21 }}>Be specific about what you do and who you want to meet.</Text>
      {error ? <Text style={{ color: '#FFB6B6', marginBottom: 12 }}>{error}</Text> : null}
      <PrimaryButton label={saving ? 'Saving...' : 'Save changes'} disabled={saving || !name.trim()} onPress={save} />
      <View style={{ height: 1, backgroundColor: c.glassBorder, marginVertical: 30 }} />
      <Eyebrow>ACCOUNT & SAFETY</Eyebrow>
      <ScalePressable accessibilityRole="button" onPress={() => router.push('/blocked')} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 18, gap: 11 }}>
        <ShieldCheck color={c.accent} size={19} />
        <Text style={{ flex: 1, color: c.text, fontFamily: 'Ubuntu_500Medium', fontSize: 15 }}>Blocked members</Text>
        <ChevronRight color={c.accent} size={18} />
      </ScalePressable>
      <ScalePressable accessibilityRole="link" onPress={() => { void Linking.openURL('https://bsquare.club/privacy-policy'); }} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 18, gap: 11, borderTopWidth: 1, borderColor: c.glassBorder }}>
        <LockKeyhole color={c.accent} size={19} />
        <Text style={{ flex: 1, color: c.text, fontFamily: 'Ubuntu_500Medium', fontSize: 15 }}>Privacy policy</Text>
        <ChevronRight color={c.accent} size={18} />
      </ScalePressable>
      <ScalePressable accessibilityRole="button" onPress={logout} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 18, gap: 11, borderTopWidth: 1, borderColor: c.glassBorder }}>
        <LogOut color={c.accent} size={19} />
        <Text style={{ flex: 1, color: c.text, fontFamily: 'Ubuntu_500Medium', fontSize: 15 }}>Sign out</Text>
        <ChevronRight color={c.accent} size={18} />
      </ScalePressable>
      <View style={{ height: 1, backgroundColor: c.glassBorder, marginVertical: 23 }} />
      <Eyebrow>DELETE ACCOUNT</Eyebrow>
      <Text style={{ color: c.textDim, fontFamily: 'Ubuntu_400Regular', fontSize: 13, lineHeight: 21, marginTop: 13, marginBottom: 14 }}>Account deletion is permanent. Enter your password if one is set, then confirm deletion.</Text>
      <TextInput accessibilityLabel="Password for account deletion" secureTextEntry autoCapitalize="none" value={deletePassword} onChangeText={setDeletePassword} placeholder="Current password (if applicable)" placeholderTextColor={c.textFaint} style={fieldStyle} />
      <ScalePressable accessibilityRole="button" onPress={deleteAccount} style={{ flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 19 }}>
        <Trash2 color="#FFB6B6" size={17} />
        <Text style={{ fontFamily: 'Ubuntu_700Bold', color: '#FFB6B6' }}>Delete my account permanently</Text>
      </ScalePressable>
    </View>
  </ScrollView>;
}
