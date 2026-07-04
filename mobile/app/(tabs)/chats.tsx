import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { GlassCard } from '@/components/GlassCard';
import { PressableScale } from '@/components/PressableScale';
import { VerifiedSeal } from '@/components/VerifiedSeal';
import { Avatar, Eyebrow } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { Fonts } from '@/lib/typography';
import { CHATS } from '@/lib/mockData';

export default function Chats() {
  const { colors } = useTheme();

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Chats</Text>
        <Eyebrow>{CHATS.length} conversations</Eyebrow>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {CHATS.map((chat) => (
          <PressableScale key={chat.id} scaleTo={0.98} style={{ marginBottom: 12 }}>
            <GlassCard>
              <View style={styles.row}>
                <View>
                  <Avatar name={chat.name} size={50} />
                  {chat.online && (
                    <View style={[styles.online, { backgroundColor: colors.accent, borderColor: colors.surface }]} />
                  )}
                </View>

                <View style={{ flex: 1, marginLeft: 13 }}>
                  <View style={styles.topLine}>
                    <View style={styles.nameRow}>
                      <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                        {chat.name}
                      </Text>
                      {chat.verified && <VerifiedSeal size={16} />}
                    </View>
                    <Text style={[styles.time, { color: colors.textFaint }]}>{chat.timestamp}</Text>
                  </View>

                  <View style={styles.bottomLine}>
                    <Text style={[styles.preview, { color: colors.textDim }]} numberOfLines={1}>
                      {chat.preview}
                    </Text>
                    {chat.unread > 0 && (
                      <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                        <Text style={[styles.badgeText, { color: colors.onAccent }]}>{chat.unread}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </GlassCard>
          </PressableScale>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  title: { fontFamily: Fonts.displayBold, fontSize: 28 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  row: { flexDirection: 'row', alignItems: 'center' },
  online: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 2,
  },
  topLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, paddingRight: 8 },
  name: { fontFamily: Fonts.displaySemiBold, fontSize: 16, flexShrink: 1 },
  time: { fontFamily: Fonts.monoRegular, fontSize: 11 },
  bottomLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 5 },
  preview: { fontFamily: Fonts.bodyRegular, fontSize: 13.5, flex: 1, paddingRight: 10 },
  badge: { minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontFamily: Fonts.bodyBold, fontSize: 11 },
});
