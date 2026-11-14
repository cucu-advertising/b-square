import { useThemeColors } from '../lib/theme';
import { Redirect } from 'expo-router';
/** Deprecated demo route. Real membership requires server-backed authentication. */
export default function DeprecatedDemoRoute() {
  const colors = useThemeColors(); return <Redirect href="/login" />; }
