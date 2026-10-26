/** Types and unsupported-platform fallback for native Firebase SMS modules. */
export async function sendPhoneCode(_phoneE164: string): Promise<void> {
  throw new Error('Phone authentication requires a native Firebase build.');
}
export async function confirmPhoneCode(_code: string): Promise<string> {
  throw new Error('Phone authentication requires a native Firebase build.');
}
export function clearPhoneVerification(): void {}
