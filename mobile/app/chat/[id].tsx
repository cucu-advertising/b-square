import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MessageCircle } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePressScale } from '../../hooks/usePressScale';
import { fonts } from '../../lib/fonts';
import { CHATS } from '../../lib/mockData';
import { useTheme } from '../../lib/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Placeholder chat thread — full messaging is out of scope for this prototype. */
export default function ChatDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const chat = CHATS.find((c) => c.id === id);
  const { style, onPressIn, onPressOut } = usePressScale(0.9);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.void }]}>
      <View style={styles.header}>
        <AnimatedPressable
          onPress={() => router.back()}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          style={[style, styles.backButton, { backgroundColor: theme.colors.glass, borderColor: theme.colors.glassBorder }]}
        >
          <ArrowLeft size={20} color={theme.colors.text} />
        </AnimatedPressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{chat?.name ?? 'Chat'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.center}>
        <View style={[styles.iconWrap, { backgroundColor: theme.colors.glass, borderColor: theme.colors.glassBorder }]}>
          <MessageCircle size={28} color={theme.colors.textFaint} />
        </View>
        <Text style={[styles.text, { color: theme.colors.textDim }]}>
          Messaging isn't part of this prototype yet.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: fonts.display600,
    fontSize: 17,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 40,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: fonts.body400,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
