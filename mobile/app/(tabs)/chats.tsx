import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScalePressable } from '../../components/AnimatedUI';
import { useThemeColors } from '../../lib/theme';
import { CHAT_PREVIEWS } from '../../lib/mockData';

export default function ChatsScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.void }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: colors.text }]}>Chats</Text>
      </View>

      <FlatList
        data={CHAT_PREVIEWS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        renderItem={({ item }) => (
          <ScalePressable
            style={[styles.row, { borderBottomColor: colors.glassBorder }]}
            scaleTo={0.98}
          >
            <View style={styles.avatarWrap}>
              <View style={[styles.avatar, { backgroundColor: colors.surface }]}>
                <Text style={[styles.initials, { color: colors.text }]}>{item.initials}</Text>
              </View>
              {item.online && (
                <View style={[styles.onlineDot, { backgroundColor: colors.accent }]} />
              )}
            </View>

            <View style={styles.content}>
              <View style={styles.topRow}>
                <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.time, { color: colors.textFaint }]}>{item.timestamp}</Text>
              </View>
              <View style={styles.bottomRow}>
                <Text
                  style={[styles.preview, { color: colors.textDim }]}
                  numberOfLines={1}
                >
                  {item.lastMessage}
                </Text>
                {item.unread > 0 && (
                  <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                    <Text style={[styles.badgeText, { color: colors.onAccent }]}>
                      {item.unread}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </ScalePressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 14,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  initials: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 15,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 16,
  },
  time: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  preview: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },
});
