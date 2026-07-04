import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ScalePressable, StaggeredFadeIn } from './AnimatedUI';
import { VerifiedSeal } from './VerifiedSeal';
import { GhostButton } from './GhostButton';
import { useThemeColors } from '../lib/theme';
import { BusinessProfile } from '../lib/mockData';
import { useReducedMotion } from '../hooks/useReducedMotion';

type BusinessCardProps = {
  business: BusinessProfile;
  index: number;
};

export function BusinessCard({ business, index }: BusinessCardProps) {
  const colors = useThemeColors();
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const openProfile = () => router.push(`/profile/${business.id}`);

  return (
    <StaggeredFadeIn index={index} reduceMotion={reduceMotion}>
      <ScalePressable
        onPress={openProfile}
        style={[
          styles.card,
          {
            backgroundColor: colors.glass,
            borderColor: colors.glassBorder,
          },
        ]}
        scaleTo={0.98}
      >
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={[styles.name, { color: colors.text }]}>{business.name}</Text>
            <Text style={[styles.role, { color: colors.textDim }]}>
              {business.role}, {business.business}
            </Text>
          </View>
          <ScalePressable onPress={openProfile} scaleTo={0.95}>
            <VerifiedSeal size={32} />
          </ScalePressable>
        </View>

        <View style={styles.metaRow}>
          <View style={[styles.industryPill, { backgroundColor: colors.surface }]}>
            <Text style={[styles.industryText, { color: colors.textDim }]}>
              {business.industry}
            </Text>
          </View>
          <Text style={[styles.distance, { color: colors.textFaint }]}>
            {business.distance.toUpperCase()}
          </Text>
        </View>

        <View style={styles.actions}>
          <ScalePressable
            style={[styles.connectBtn, { backgroundColor: colors.accent }]}
            scaleTo={0.96}
          >
            <Text style={[styles.connectText, { color: colors.onAccent }]}>Connect</Text>
          </ScalePressable>
          <GhostButton label="View card" onPress={openProfile} />
        </View>
      </ScalePressable>
    </StaggeredFadeIn>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleBlock: {
    flex: 1,
    paddingRight: 12,
    gap: 4,
  },
  name: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 18,
  },
  role: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  industryPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  industryText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  distance: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
    letterSpacing: 1.2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  connectBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  connectText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
});
