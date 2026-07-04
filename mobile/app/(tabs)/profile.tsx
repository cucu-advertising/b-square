import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, Clock, IdCard, Radar } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlowBlob } from '../../components/GlowBlob';
import { VerifiedSeal } from '../../components/VerifiedSeal';
import { useFocusPointerEvents } from '../../hooks/useFocusPointerEvents';
import { fonts } from '../../lib/fonts';
import { SELF_PROFILE } from '../../lib/mockData';
import { useTheme } from '../../lib/theme';

const MENU_ITEMS = [
  { icon: IdCard, label: 'Edit business card', value: '', key: 'edit' },
  { icon: Radar, label: 'Networking radius', value: '5 km', key: 'radius' },
  { icon: Clock, label: 'Active hours', value: '9 AM – 7 PM', key: 'hours' },
] as const;

export default function ProfileScreen() {
  const theme = useTheme();
  const pointerEvents = useFocusPointerEvents();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.void, pointerEvents }]}
      edges={['top']}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[theme.colors.heroA, theme.colors.heroB]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <GlowBlob size={280} color={theme.colors.glow} style={styles.glowBlob} />

          <View style={styles.sealWrap}>
            <VerifiedSeal size={34} />
          </View>

          <Text style={[styles.name, { color: theme.colors.text }]}>{SELF_PROFILE.name}</Text>
          <Text style={[styles.role, { color: theme.colors.textDim }]}>
            {SELF_PROFILE.role}, {SELF_PROFILE.company}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: theme.colors.accent }]}>
                {SELF_PROFILE.connections}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textFaint }]}>CONNECTIONS</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.colors.glassBorder }]} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: theme.colors.accent }]}>
                {SELF_PROFILE.introsMade}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textFaint }]}>INTROS MADE</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.colors.glassBorder }]} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: theme.colors.accent }]}>
                {SELF_PROFILE.trustScore.toFixed(1)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textFaint }]}>TRUST SCORE</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.menu}>
          {MENU_ITEMS.map((item, index) => (
            <View
              key={item.key}
              style={[
                styles.menuRow,
                index < MENU_ITEMS.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: theme.colors.glassBorder,
                },
              ]}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconWrap, { backgroundColor: theme.colors.glass }]}>
                  <item.icon size={18} color={theme.colors.textDim} />
                </View>
                <Text style={[styles.menuLabel, { color: theme.colors.text }]}>{item.label}</Text>
              </View>
              <View style={styles.menuRight}>
                {!!item.value && (
                  <Text style={[styles.menuValue, { color: theme.colors.textFaint }]}>
                    {item.value}
                  </Text>
                )}
                <ChevronRight size={18} color={theme.colors.textFaint} />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 28,
    overflow: 'hidden',
  },
  glowBlob: {
    position: 'absolute',
    top: -80,
    left: -60,
  },
  sealWrap: {
    position: 'absolute',
    top: 24,
    right: 24,
  },
  name: {
    fontFamily: fonts.display700,
    fontSize: 26,
    marginTop: 12,
  },
  role: {
    fontFamily: fonts.body400,
    fontSize: 15,
    marginTop: 4,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    gap: 4,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 34,
    marginHorizontal: 8,
  },
  statValue: {
    fontFamily: fonts.display700,
    fontSize: 22,
  },
  statLabel: {
    fontFamily: fonts.mono400,
    fontSize: 9.5,
    letterSpacing: 0.7,
  },
  menu: {
    paddingHorizontal: 24,
    marginTop: 12,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontFamily: fonts.body600,
    fontSize: 15,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuValue: {
    fontFamily: fonts.mono400,
    fontSize: 12.5,
  },
});
