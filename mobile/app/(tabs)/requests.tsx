import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Check, Inbox, X } from 'lucide-react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScalePressable } from '../../components/AnimatedUI';
import { useThemeColors } from '../../lib/theme';
import { ConnectionRequest } from '../../lib/mockData';
import { useRequestsStore, useToastStore } from '../../lib/store';

export default function RequestsScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const requests = useRequestsStore((s) => s.requests);
  const removeRequest = useRequestsStore((s) => s.removeRequest);
  const showToast = useToastStore((s) => s.showToast);

  const handleAction = (id: string, action: 'accept' | 'decline') => {
    removeRequest(id);
    if (action === 'accept') {
      showToast('Connected ✓');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.void }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: colors.text }]}>Requests</Text>
        <Text style={[styles.subtitle, { color: colors.textDim }]}>
          {requests.length} pending intro{requests.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <View style={[styles.list, { paddingBottom: insets.bottom + 24 }]}>
        {requests.length === 0 ? (
          <View style={styles.empty}>
            <Inbox size={40} color={colors.textFaint} strokeWidth={1.5} />
            <Text style={[styles.emptyText, { color: colors.textDim }]}>
              You're all caught up.
            </Text>
          </View>
        ) : (
          requests.map((request) => (
            <RequestRow
              key={request.id}
              request={request}
              onAccept={() => handleAction(request.id, 'accept')}
              onDecline={() => handleAction(request.id, 'decline')}
            />
          ))
        )}
      </View>
    </View>
  );
}

type RequestRowProps = {
  request: ConnectionRequest;
  onAccept: () => void;
  onDecline: () => void;
};

function RequestRow({ request, onAccept, onDecline }: Omit<RequestRowProps, 'isRemoving'>) {
  const colors = useThemeColors();
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const height = useSharedValue(120);
  const [exiting, setExiting] = useState(false);

  const animateOut = (dir: 'accept' | 'decline', callback: () => void) => {
    if (exiting) return;
    setExiting(true);
    translateX.value = withTiming(dir === 'accept' ? 80 : -80, { duration: 280 });
    opacity.value = withTiming(0, { duration: 280 });
    height.value = withTiming(0, { duration: 220 }, (finished) => {
      if (finished) {
        runOnJS(callback)();
      }
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
    height: exiting ? height.value : undefined,
    marginBottom: exiting ? 0 : 12,
    overflow: 'hidden',
  }));

  return (
    <Animated.View
      style={[
        styles.row,
        {
          backgroundColor: colors.glass,
          borderColor: colors.glassBorder,
        },
        animatedStyle,
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: colors.surface }]}>
        <Text style={[styles.initials, { color: colors.text }]}>{request.initials}</Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.name, { color: colors.text }]}>{request.name}</Text>
        <Text style={[styles.role, { color: colors.textDim }]}>
          {request.role}, {request.business}
        </Text>
        <Text style={[styles.message, { color: colors.textDim }]}>"{request.message}"</Text>
      </View>

      <View style={styles.actions}>
        <ScalePressable
          onPress={() => !exiting && animateOut('accept', onAccept)}
          style={[styles.actionBtn, { backgroundColor: colors.accent }]}
          scaleTo={0.92}
        >
          <Check size={18} color={colors.onAccent} strokeWidth={2.5} />
        </ScalePressable>
        <ScalePressable
          onPress={() => !exiting && animateOut('decline', onDecline)}
          style={[
            styles.actionBtn,
            {
              backgroundColor: colors.glass,
              borderColor: colors.glassBorder,
              borderWidth: 1,
            },
          ]}
          scaleTo={0.92}
        >
          <X size={18} color={colors.textDim} strokeWidth={2} />
        </ScalePressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    gap: 4,
    marginBottom: 16,
  },
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 14,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 16,
  },
  role: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
  },
  message: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 6,
    lineHeight: 18,
  },
  actions: {
    gap: 8,
    paddingTop: 4,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingTop: 80,
  },
  emptyText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
  },
});
