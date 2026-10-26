import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

let pending: FirebaseAuthTypes.ConfirmationResult | null = null;

export async function sendPhoneCode(phoneE164: string): Promise<void> {
  if (!/^\+91[6-9]\d{9}$/.test(phoneE164)) throw new Error('Enter a valid Indian mobile number.');
  pending = await auth().signInWithPhoneNumber(phoneE164);
}

export async function confirmPhoneCode(code: string): Promise<string> {
  if (!pending) throw new Error('Request a new verification code first.');
  if (!/^\d{6}$/.test(code)) throw new Error('Enter the 6-digit code.');
  const credential = await pending.confirm(code);
  if (!credential?.user) throw new Error('Phone verification failed.');
  const idToken = await credential.user.getIdToken(true);
  pending = null;
  return idToken;
}
export function clearPhoneVerification() { pending = null; }
