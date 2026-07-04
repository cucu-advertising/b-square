import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusPointerEvents } from '../../hooks/useFocusPointerEvents';
import { usePressScale } from '../../hooks/usePressScale';
import { fonts } from '../../lib/fonts';
import { ChatPreview } from '../../lib/mockData';
import { useAppStore } from '../../lib/store';
import { useTheme } from '../../lib/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ChatRow({ chat, onPress }: { chat: ChatPreview; onPress: () => void }) {
  const theme = useTheme();
  const { style, onPressIn, onPressOut } = usePressScale(0.98);

  return (
    <AnimatedPressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} style={style}>
      <View style={styles.row}>
        <View style={styles.avatarWrap}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.avatarText, { color: theme.colors.text }]}>{chat.initials}</Text>
          </View>
          {chat.online && (
            <View
              style={[
                styles.onlineDot,
                { backgroundColor: theme.colors.accent, borderColor: theme.colors.void },
              ]}
            />
          )}
        </View>

        <View style={styles.rowContent}>
          <View style={styles.rowTop}>
            <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
              {chat.name}
            </Text>
            <Text style={[styles.timestamp, { color: theme.colors.textFaint }]}>
              {chat.timestamp}
            </Text>
          </View>
          <View style={styles.rowBottom}>
            <Text style={[styles.preview, { color: theme.colors.textDim }]} numberOfLines={1}>
              {chat.lastMessage}
            </Text>
            {chat.unread > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: theme.colors.accent }]}>
                <Text style={[styles.unreadText, { color: theme.colors.onAccent }]}>
                  {chat.unread}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
}

export default function ChatsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const chats = useAppStore((s) => s.chats);
  const pointerEvents = useFocusPointerEvents();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.void, pointerEvents }]}
      edges={['top']}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Chats</Text>
      </View>

      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: theme.colors.glassBorder }]} />
        )}
        renderItem={({ item }) => (
          <ChatRow chat={item} onPress={() => router.push(`/chat/${item.id}`)} />
        )}
      />
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
    paddingBottom: 12,
  },
  headerTitle: {
    fontFamily: fonts.display700,
    fontSize: 26,
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.display600,
    fontSize: 16,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    borderWidth: 2,
  },
  rowContent: {
    flex: 1,
    gap: 4,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontFamily: fonts.display600,
    fontSize: 16,
    flexShrink: 1,
  },
  timestamp: {
    fontFamily: fonts.mono400,
    fontSize: 11,
  },
  rowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  preview: {
    fontFamily: fonts.body400,
    fontSize: 13.5,
    flex: 1,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  unreadText: {
    fontFamily: fonts.body600,
    fontSize: 11,
  },
});
