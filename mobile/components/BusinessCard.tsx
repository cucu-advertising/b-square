import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { usePressScale } from '../hooks/usePressScale';
import { fonts } from '../lib/fonts';
import { Business } from '../lib/mockData';
import { useTheme } from '../lib/theme';
import { GhostButton } from './GhostButton';
import { PrimaryButton } from './PrimaryButton';
import { VerifiedSeal } from './VerifiedSeal';

type Props = {
  business: Business;
  index?: number;
  onConnect?: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function BusinessCard({ business, index = 0, onConnect }: Props) {
  const theme = useTheme();
  const router = useRouter();
  const { style: pressStyle, onPressIn, onPressOut } = usePressScale(0.98);

  const entrance = useSharedValue(0);
  useEffect(() => {
    entrance.value = withDelay(index * 60, withTiming(1, { duration: 420 }));
  }, [entrance, index]);

  const entranceStyle = useAnimatedStyle(() => ({
    opacity: entrance.value,
    transform: [{ translateY: (1 - entrance.value) * 14 }],
  }));

  const goToDetail = () => router.push(`/profile/${business.id}`);

  return (
    <Animated.View style={entranceStyle}>
      <AnimatedPressable
        onPress={goToDetail}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={pressStyle}
      >
        <View
          style={[
            styles.card,
            { backgroundColor: theme.colors.glass, borderColor: theme.colors.glassBorder },
          ]}
        >
          <View style={styles.headerRow}>
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
                {business.name}
              </Text>
              <Pressable hitSlop={8} onPress={goToDetail}>
                <VerifiedSeal size={20} />
              </Pressable>
            </View>
          </View>
          <Text style={[styles.role, { color: theme.colors.textDim }]} numberOfLines={1}>
            {business.role}
          </Text>

          <View style={styles.metaRow}>
            <View
              style={[
                styles.tag,
                { backgroundColor: theme.colors.glass, borderColor: theme.colors.glassBorder },
              ]}
            >
              <Text style={[styles.tagText, { color: theme.colors.textDim }]}>
                {business.industry}
              </Text>
            </View>
            <Text style={[styles.distance, { color: theme.colors.textFaint }]}>
              {business.distanceKm.toFixed(1)} KM
            </Text>
          </View>

          <View style={styles.actionsRow}>
            <PrimaryButton
              label="Connect"
              variant="accent"
              onPress={onConnect}
              style={styles.actionButton}
            />
            <GhostButton label="View card" onPress={goToDetail} style={styles.actionButton} />
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    gap: 6,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  name: {
    fontFamily: fonts.display600,
    fontSize: 18,
    flexShrink: 1,
  },
  role: {
    fontFamily: fonts.body400,
    fontSize: 13.5,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  tag: {
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontFamily: fonts.body500,
    fontSize: 12,
  },
  distance: {
    fontFamily: fonts.mono400,
    fontSize: 11,
    letterSpacing: 0.6,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
  },
});
