import { Redirect } from 'expo-router';
/** Legacy SMS OTP route. Bsquare uses registered-email sign-in codes. */
export default function LegacyOtpScreen() { return <Redirect href="/email-sign-in" />; }
