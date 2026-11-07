export async function sendPhoneCode(_phoneE164: string): Promise<void> {
  throw new Error('SMS verification requires an Android or iOS development build.');
}
export async function confirmPhoneCode(_code: string): Promise<string> {
  throw new Error('SMS verification requires an Android or iOS development build.');
}
export function clearPhoneVerification() {}
