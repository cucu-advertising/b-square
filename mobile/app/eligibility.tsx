import { useMemo } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScalePressable } from '../components/AnimatedUI';
import { useThemeColors } from '../lib/theme';
import { useAdmissionStore } from '../lib/admissionStore';
import { evaluateAdmission } from '../lib/admission';

const METHODS = [
  { key: 'linkedin', title: 'LinkedIn', body: 'Use your professional identity and leadership role as a trust signal.' },
  { key: 'work_email', title: 'Work email', body: 'Verify using your company-domain email address.' },
  { key: 'registry', title: 'Business registry', body: 'Use DIN, CIN, LLPIN, GSTIN or another official business record.' },
  { key: 'referral', title: 'Member referral', body: 'Ask an existing verified Bsquare member to vouch for you.' },
] as const;

export default function EligibilityScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const roleTitle = useAdmissionStore((s) => s.roleTitle);
  const setRoleTitle = useAdmissionStore((s) => s.setRoleTitle);
  const workEmail = useAdmissionStore((s) => s.workEmail);
  const setWorkEmail = useAdmissionStore((s) => s.setWorkEmail);
  const companyWebsite = useAdmissionStore((s) => s.companyWebsite);
  const setCompanyWebsite = useAdmissionStore((s) => s.setCompanyWebsite);
  const linkedinUrl = useAdmissionStore((s) => s.linkedinUrl);
  const setLinkedinUrl = useAdmissionStore((s) => s.setLinkedinUrl);
  const verificationMethod = useAdmissionStore((s) => s.verificationMethod);
  const setVerificationMethod = useAdmissionStore((s) => s.setVerificationMethod);
  const setAdmissionResult = useAdmissionStore((s) => s.setAdmissionResult);

  const canContinue = useMemo(() => {
    if (!roleTitle.trim() || !verificationMethod) return false;
    if (verificationMethod === 'linkedin') return linkedinUrl.includes('linkedin.com/');
    if (verificationMethod === 'work_email') return /@[^@]+\.[^@]+$/.test(workEmail.trim());
    return true;
  }, [linkedinUrl, roleTitle, verificationMethod, workEmail]);

  const handleContinue = () => {
    const result = evaluateAdmission({
      roleTitle,
      linkedInVerified: verificationMethod === 'linkedin' && linkedinUrl.includes('linkedin.com/'),
      workEmailVerified: verificationMethod === 'work_email' && /@[^@]+\.[^@]+$/.test(workEmail.trim()),
      companyWebsite,
      businessRegistryVerified: verificationMethod === 'registry',
      memberReferralVerified: verificationMethod === 'referral',
      profileComplete: true,
    });
    setAdmissionResult(result.score, result.status, result.reasons);
    router.push('/admission-status');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.void }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 28 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.eyebrow, { color: colors.accent }]}>MEMBERSHIP CHECK</Text>
        <Text style={[styles.title, { color: colors.text }]}>Verify your professional standing</Text>
        <Text style={[styles.subtitle, { color: colors.textDim }]}>
          Bsquare is designed for founders, owners, senior leaders, investors and trusted business decision-makers.
        </Text>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textFaint }]}>CURRENT ROLE</Text>
          <TextInput
            value={roleTitle}
            onChangeText={setRoleTitle}
            placeholder="e.g. Founder & CEO"
            placeholderTextColor={colors.textFaint}
            style={[styles.input, { color: colors.text, backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textFaint }]}>COMPANY WEBSITE</Text>
          <TextInput
            value={companyWebsite}
            onChangeText={setCompanyWebsite}
            autoCapitalize="none"
            keyboardType="url"
            placeholder="https://yourcompany.com"
            placeholderTextColor={colors.textFaint}
            style={[styles.input, { color: colors.text, backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
          />
        </View>

        <Text style={[styles.label, { color: colors.textFaint }]}>CHOOSE A VERIFICATION METHOD</Text>
        <View style={styles.methods}>
          {METHODS.map((method) => {
            const selected = verificationMethod === method.key;
            return (
              <ScalePressable
                key={method.key}
                onPress={() => setVerificationMethod(method.key)}
                style={[
                  styles.method,
                  {
                    backgroundColor: selected ? colors.glass : colors.glass,
                    borderColor: selected ? colors.accent : colors.glassBorder,
                  },
                ]}
                scaleTo={0.98}
              >
                <Text style={[styles.methodTitle, { color: colors.text }]}>{method.title}</Text>
                <Text style={[styles.methodBody, { color: colors.textDim }]}>{method.body}</Text>
              </ScalePressable>
            );
          })}
        </View>

        {verificationMethod === 'linkedin' ? (
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textFaint }]}>LINKEDIN PROFILE</Text>
            <TextInput
              value={linkedinUrl}
              onChangeText={setLinkedinUrl}
              autoCapitalize="none"
              keyboardType="url"
              placeholder="https://linkedin.com/in/yourname"
              placeholderTextColor={colors.textFaint}
              style={[styles.input, { color: colors.text, backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
            />
            <Text style={[styles.helper, { color: colors.textFaint }]}>
              LinkedIn is one trust signal. Final admission can still require additional verification.
            </Text>
          </View>
        ) : null}

        {verificationMethod === 'work_email' ? (
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textFaint }]}>WORK EMAIL</Text>
            <TextInput
              value={workEmail}
              onChangeText={setWorkEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="you@company.com"
              placeholderTextColor={colors.textFaint}
              style={[styles.input, { color: colors.text, backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
            />
          </View>
        ) : null}

        <PrimaryButton label="Check eligibility" onPress={handleContinue} disabled={!canContinue} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 24, gap: 18 },
  eyebrow: { fontFamily: 'JetBrainsMono_500Medium', fontSize: 11, letterSpacing: 2 },
  title: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 30, lineHeight: 36 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 22 },
  field: { gap: 9 },
  label: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, letterSpacing: 1.5 },
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontFamily: 'Inter_500Medium', fontSize: 15 },
  helper: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18 },
  methods: { gap: 10 },
  method: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 5 },
  methodTitle: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 16 },
  methodBody: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19 },
});
