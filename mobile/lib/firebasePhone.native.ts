/** SMS authentication is not shipped in this email-OTP release. */
export async function sendPhoneCode(_phoneE164: string): Promise<void> {
  throw new Error('Sign in with your verified email instead.');
}
export async function confirmPhoneCode(_code: string): Promise<string> {
  throw new Error('Sign in with your verified email instead.');
}
export function clearPhoneVerification(): void {}
