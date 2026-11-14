import { Redirect } from 'expo-router';
/** Phone linking is intentionally unavailable in the email-OTP release. */
export default function LinkPhoneScreen() { return <Redirect href="/(tabs)/profile" />; }
