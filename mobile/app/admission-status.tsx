import { StyleSheet, Text, View } from 'react-native';
import { DEMO_MODE } from '../lib/release';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { useThemeColors } from '../lib/theme';
import { useAdmissionStore } from '../lib/admissionStore';
import { useAuthStore } from '../lib/store';

export default function AdmissionStatusScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const status = useAdmissionStore((s) => s.admissionStatus);
  const score = useAdmissionStore((s) => s.admissionScore);
  const reasons = useAdmissionStore((s) => s.admissionReasons);
  const setOnboarded = useAuthStore((s) => s.setOnboarded);

  const copy =
    status === 'approved'
      ? {
          title: 'Demo eligibility result',
          body: 'This is a simulated eligibility result. Your identity has not been verified and no membership has been granted.',
          button: 'Explore demo screens',
        }
      : status === 'manual_review'
        ? {
            title: 'Demo review outcome',
            body: 'This is a simulated review state. No application has been sent.',
            button: 'Explore demo screens',
          }
        : {
            title: 'More verification required',
            body: 'This is a demo score only, not a verified eligibility decision.',
            button: 'Update verification',
          };

  const handlePress = () => {
    if (!DEMO_MODE) return;
    if (status === 'more_verification') {
      router.back();
      return;
    }
    setOnboarded(true);
    router.replace('/(tabs)/nearby');
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.void,
          paddingTop: insets.top + 36,
          paddingBottom: insets.bottom + 24,
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={[styles.eyebrow, { color: colors.accent }]}>ADMISSION STATUS</Text>
        <Text style={[styles.title, { color: colors.text }]}>{copy.title}</Text>
        <Text style={[styles.body, { color: colors.textDim }]}>{copy.body}</Text>

        <View style={[styles.scoreCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
          <Text style={[styles.scoreLabel, { color: colors.textFaint }]}>TRUST SCORE</Text>
          <Text style={[styles.score, { color: colors.accent }]}>{score}/100</Text>
          {reasons.map((reason) => (
            <Text key={reason} style={[styles.reason, { color: colors.textDim }]}>• {reason}</Text>
          ))}
        </View>
      </View>

      <PrimaryButton label={DEMO_MODE ? copy.button : 'Verification required'} onPress={handlePress} disabled={!DEMO_MODE} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between' },
  content: { gap: 18 },
  eyebrow: { fontFamily: 'Ubuntu_500Medium', fontSize: 11, letterSpacing: 2 },
  title: { fontFamily: 'Ubuntu_700Bold', fontSize: 32, lineHeight: 38 },
  body: { fontFamily: 'Ubuntu_400Regular', fontSize: 16, lineHeight: 24 },
  scoreCard: { borderWidth: 1, borderRadius: 18, padding: 20, gap: 8, marginTop: 8 },
  scoreLabel: { fontFamily: 'Ubuntu_400Regular', fontSize: 10, letterSpacing: 1.5 },
  score: { fontFamily: 'Ubuntu_700Bold', fontSize: 34 },
  reason: { fontFamily: 'Ubuntu_400Regular', fontSize: 13, lineHeight: 19 },
});
