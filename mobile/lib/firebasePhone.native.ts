import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

let pending: FirebaseAuthTypes.ConfirmationResult | null = null;

function readablePhoneError(error: unknown): Error {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
  const message = error instanceof Error ? error.message : '';
  if (code.includes('billing-not') || message.includes('BILLING_NOT_ENABLED')) return new Error('SMS verification is temporarily unavailable. Please sign in with email while we activate SMS delivery.');
  if (code.includes('too-many-requests')) return new Error('Too many verification attempts. Please try again later.');
  if (code.includes('invalid-phone-number')) return new Error('Enter a valid Indian mobile number.');
  if (code.includes('quota-exceeded')) return new Error('SMS verification is temporarily unavailable. Please try again later.');
  return new Error(message || 'Could not send the verification code. Please try again.');
}

export async function sendPhoneCode(phoneE164: string): Promise<void> {
  if (!/^\+91[6-9]\d{9}$/.test(phoneE164)) throw new Error('Enter a valid Indian mobile number.');
  try {
    pending = await auth().signInWithPhoneNumber(phoneE164);
  } catch (error) { throw readablePhoneError(error); }
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
