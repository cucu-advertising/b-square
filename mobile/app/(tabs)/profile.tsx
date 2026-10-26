import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScalePressable } from '../../components/AnimatedUI';
import { SectionHeading } from '../../components/ScreenStates';
import { api } from '../../lib/api';
import { useSession } from '../../lib/session';
export default function ProfileScreen() {
  const router = useRouter(); const { user, signOut, updateUser } = useSession();
  const [name, setName] = useState(user?.name || ''); const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false); const [error, setError] = useState('');
  const save = async () => { setSaving(true); setError(''); try { const data = await api.updateMe({ name, bio }); updateUser(data.user); Alert.alert('Saved', 'Your profile has been updated.'); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to update profile'); } finally { setSaving(false); } };
  const logout = async () => { await signOut(); router.replace('/login'); };
  const deleteAccount = () => Alert.alert('Permanently delete account?', 'This will permanently delete your account and associated account information. This cannot be undone.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete permanently', style: 'destructive', onPress: async () => { try { await api.deleteAccount(); await signOut(); router.replace('/login'); } catch (e) { setError(e instanceof Error ? e.message : 'Deletion failed. Please try again.'); } } }]);
  return <ScrollView style={{ flex: 1, backgroundColor: '#F8FAFE' }} contentContainerStyle={{ paddingBottom: 65 }}><SectionHeading title="My profile" subtitle={user?.company_name || 'Your B Square membership'} /><View style={{ paddingHorizontal: 24, gap: 14 }}>
    <Text style={{ color: '#234FC8', fontFamily: 'Ubuntu_500Medium', fontSize: 12 }}>APPROVED MEMBER</Text>
    <Text style={{ color: '#526789', fontFamily: 'Ubuntu_500Medium', marginTop: 14 }}>Name</Text>
    <TextInput value={name} onChangeText={setName} style={{ borderWidth: 1, borderColor: '#DDE5F3', borderRadius: 14, backgroundColor: 'white', padding: 15, fontFamily: 'Ubuntu_400Regular', color: '#102758', fontSize: 16 }} />
    <Text style={{ color: '#526789', fontFamily: 'Ubuntu_500Medium' }}>About your business</Text>
    <TextInput multiline value={bio} onChangeText={setBio} maxLength={1500} placeholder="What should other members know?" style={{ textAlignVertical: 'top', borderWidth: 1, borderColor: '#DDE5F3', borderRadius: 14, backgroundColor: 'white', minHeight: 98, padding: 15, fontFamily: 'Ubuntu_400Regular', color: '#102758', fontSize: 15 }} />
    {user?.email ? <Text style={{ color: '#62728C' }}>Email: {user.email}</Text> : null}
    {error ? <Text style={{ color: '#A52D38' }}>{error}</Text> : null}
    <PrimaryButton label={saving ? 'Saving...' : 'Save changes'} disabled={saving || !name.trim()} onPress={save} />
    <ScalePressable onPress={() => router.push('/link-phone')} style={{ marginTop: 16, paddingVertical: 12 }}><Text style={{ color: '#234FC8', fontFamily: 'Ubuntu_500Medium' }}>Link phone for SMS sign-in →</Text></ScalePressable>
    <ScalePressable onPress={() => router.push('/blocked')} style={{ marginTop: 25, paddingVertical: 12 }}><Text style={{ color: '#102758', fontFamily: 'Ubuntu_500Medium' }}>Blocked members →</Text></ScalePressable>
    <ScalePressable onPress={logout} style={{ paddingVertical: 12 }}><Text style={{ color: '#234FC8', fontFamily: 'Ubuntu_500Medium' }}>Sign out</Text></ScalePressable>
    <ScalePressable onPress={deleteAccount} style={{ paddingVertical: 12 }}><Text style={{ color: '#A52D38', fontFamily: 'Ubuntu_500Medium' }}>Delete my account permanently</Text></ScalePressable>
  </View></ScrollView>;
}
