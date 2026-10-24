import { Redirect } from 'expo-router';
/** Deprecated demo route. Real membership requires server-backed authentication. */
export default function DeprecatedDemoRoute() { return <Redirect href="/login" />; }
