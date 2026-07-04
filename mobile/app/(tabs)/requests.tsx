import { Check, Inbox, X } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusPointerEvents } from '../../hooks/useFocusPointerEvents';
import { usePressScale } from '../../hooks/usePressScale';
import { fonts } from '../../lib/fonts';
import { ConnectionRequest } from '../../lib/mockData';
import { useAppStore } from '../../lib/store';
import { useTheme } from '../../lib/theme';
import { showToast } from '../../components/Toast';

function RequestRow({
  request,
  onAccept,
  onDecline,
}: {
  request: ConnectionRequest;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}) {
  const theme = useTheme();
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const height = useSharedValue(96);
  const marginBottom = useSharedValue(14);

  const {
    style: acceptStyle,
    onPressIn: acceptIn,
    onPressOut: acceptOut,
  } = usePressScale(0.88);
  const {
    style: declineStyle,
    onPressIn: declineIn,
    onPressOut: declineOut,
  } = usePressScale(0.88);

  const collapse = (id: string, action: 'accept' | 'decline') => {
    height.value = withTiming(0, { duration: 220 }, () => {
      runOnJS(action === 'accept' ? onAccept : onDecline)(id);
    });
    marginBottom.value = withTiming(0, { duration: 220 });
  };

  const handleAccept = () => {
    translateX.value = withTiming(400, { duration: 260 });
    opacity.value = withTiming(0, { duration: 220 }, () => {
      runOnJS(collapse)(request.id, 'accept');
    });
  };

  const handleDecline = () => {
    translateX.value = withTiming(-400, { duration: 260 });
    opacity.value = withTiming(0, { duration: 220 }, () => {
      runOnJS(collapse)(request.id, 'decline');
    });
  };

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    height: height.value,
    marginBottom: marginBottom.value,
    opacity: height.value === 0 ? 0 : 1,
  }));

  return (
    <Animated.View style={[styles.rowContainer, containerStyle]}>
      <Animated.View
        style={[
          styles.row,
          rowStyle,
          { backgroundColor: theme.colors.glass, borderColor: theme.colors.glassBorder },
        ]}
      >
        <View style={[styles.avatar, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.avatarText, { color: theme.colors.text }]}>{request.initials}</Text>
        </View>

        <View style={styles.rowContent}>
          <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
            {request.name}
          </Text>
          <Text style={[styles.role, { color: theme.colors.textDim }]} numberOfLines={1}>
            {request.role} · {request.company}
          </Text>
          <Text style={[styles.message, { color: theme.colors.textFaint }]} numberOfLines={2}>
            "{request.message}"
          </Text>
        </View>

        <View style={styles.actions}>
          <Animated.View style={acceptStyle}>
            <Pressable
              onPress={handleAccept}
              onPressIn={acceptIn}
              onPressOut={acceptOut}
              accessibilityRole="button"
              accessibilityLabel={`Accept ${request.name}`}
              style={[styles.iconButton, { backgroundColor: theme.colors.accent }]}
            >
              <Check size={18} color={theme.colors.onAccent} strokeWidth={3} />
            </Pressable>
          </Animated.View>
          <Animated.View style={declineStyle}>
            <Pressable
              onPress={handleDecline}
              onPressIn={declineIn}
              onPressOut={declineOut}
              accessibilityRole="button"
              accessibilityLabel={`Decline ${request.name}`}
              style={[
                styles.iconButton,
                { backgroundColor: theme.colors.glass, borderWidth: 1, borderColor: theme.colors.glassBorder },
              ]}
            >
              <X size={18} color={theme.colors.textDim} strokeWidth={3} />
            </Pressable>
          </Animated.View>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

export default function RequestsScreen() {
  const theme = useTheme();
  const requests = useAppStore((s) => s.requests);
  const accept = useAppStore((s) => s.accept);
  const decline = useAppStore((s) => s.decline);
  const pointerEvents = useFocusPointerEvents();

  const handleAccept = (id: string) => {
    accept(id);
    showToast('Connected ✓');
  };
  const handleDecline = (id: string) => {
    decline(id);
    showToast('Request declined');
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.void, pointerEvents }]}
      edges={['top']}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Requests</Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textFaint }]}>
          {requests.length} PENDING
        </Text>
      </View>

      {requests.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconWrap, { backgroundColor: theme.colors.glass, borderColor: theme.colors.glassBorder }]}>
            <Inbox size={28} color={theme.colors.textFaint} />
          </View>
          <Text style={[styles.emptyText, { color: theme.colors.textDim }]}>
            You're all caught up.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {requests.map((request) => (
            <RequestRow
              key={request.id}
              request={request}
              onAccept={handleAccept}
              onDecline={handleDecline}
            />
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontFamily: fonts.display700,
    fontSize: 26,
  },
  headerSubtitle: {
    fontFamily: fonts.mono500,
    fontSize: 11,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  list: {
    paddingHorizontal: 24,
  },
  rowContainer: {
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 12,
    height: 96,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.display600,
    fontSize: 15,
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: fonts.display600,
    fontSize: 15.5,
  },
  role: {
    fontFamily: fonts.body400,
    fontSize: 12.5,
  },
  message: {
    fontFamily: fonts.body400,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
  },
  actions: {
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingBottom: 80,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: fonts.body500,
    fontSize: 16,
  },
});
