import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Check, X, Inbox } from 'lucide-react-native';
import Animated, {
  Easing,
  FadeIn,
  LinearTransition,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Screen } from '@/components/Screen';
import { GlassCard } from '@/components/GlassCard';
import { PressableScale } from '@/components/PressableScale';
import { VerifiedSeal } from '@/components/VerifiedSeal';
import { Avatar, Eyebrow } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { Fonts } from '@/lib/typography';
import { useAppStore, useToastStore } from '@/lib/store';
import type { ConnectionRequest } from '@/lib/mockData';

const WIDTH = Dimensions.get('window').width;

function RequestRow({ request }: { request: ConnectionRequest }) {
  const { colors } = useTheme();
  const accept = useAppStore((s) => s.acceptRequest);
  const decline = useAppStore((s) => s.declineRequest);
  const showToast = useToastStore((s) => s.show);

  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  const runAction = (dir: 1 | -1) => {
    opacity.value = withTiming(0, { duration: 260, easing: Easing.in(Easing.cubic) });
    translateX.value = withTiming(dir * WIDTH, { duration: 300, easing: Easing.in(Easing.cubic) }, (done) => {
      if (done) {
        if (dir === 1) {
          runOnJS(accept)(request.id);
          runOnJS(showToast)('Connected ✓');
        } else {
          runOnJS(decline)(request.id);
          runOnJS(showToast)('Request declined');
        }
      }
    });
  };

  return (
    <Animated.View style={[{ marginBottom: 14 }, style]} layout={LinearTransition.springify()}>
      <GlassCard>
        <View style={styles.row}>
          <Avatar name={request.name} size={48} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                {request.name}
              </Text>
              {request.verified && <VerifiedSeal size={18} />}
            </View>
            <Text style={[styles.role, { color: colors.textDim }]} numberOfLines={1}>
              {request.role}
            </Text>
          </View>
        </View>

        <Text style={[styles.message, { color: colors.textDim }]}>“{request.message}”</Text>

        <View style={styles.actions}>
          <PressableScale
            onPress={() => runAction(-1)}
            scaleTo={0.9}
            style={[styles.circle, { borderColor: colors.glassBorder, backgroundColor: colors.glass }]}
          >
            <X size={20} color={colors.textDim} strokeWidth={2.5} />
          </PressableScale>
          <PressableScale
            onPress={() => runAction(1)}
            scaleTo={0.9}
            style={[styles.circle, { backgroundColor: colors.accent, borderColor: colors.accent, shadowColor: colors.glow }]}
          >
            <Check size={20} color={colors.onAccent} strokeWidth={2.8} />
          </PressableScale>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

export default function Requests() {
  const { colors } = useTheme();
  const requests = useAppStore((s) => s.requests);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Requests</Text>
        <Eyebrow>{requests.length > 0 ? `${requests.length} pending` : 'Inbox'}</Eyebrow>
      </View>

      {requests.length === 0 ? (
        <Animated.View style={styles.empty} entering={FadeIn.duration(400)}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
            <Inbox size={30} color={colors.textDim} strokeWidth={1.8} />
          </View>
          <Text style={[styles.emptyText, { color: colors.textDim }]}>You’re all caught up.</Text>
        </Animated.View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {requests.map((r) => (
            <RequestRow key={r.id} request={r} />
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  title: { fontFamily: Fonts.displayBold, fontSize: 28 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  row: { flexDirection: 'row', alignItems: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  name: { fontFamily: Fonts.displaySemiBold, fontSize: 16.5, flexShrink: 1 },
  role: { fontFamily: Fonts.bodyRegular, fontSize: 13, marginTop: 2 },
  message: { fontFamily: Fonts.bodyRegular, fontSize: 14, fontStyle: 'italic', marginTop: 14, lineHeight: 20 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 16 },
  circle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18, paddingBottom: 80 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  emptyText: { fontFamily: Fonts.bodyMedium, fontSize: 16 },
});
