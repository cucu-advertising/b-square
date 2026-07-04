import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CreditCard, Radar, Clock, ChevronRight } from 'lucide-react-native';
import { Screen } from '@/components/Screen';
import { PressableScale } from '@/components/PressableScale';
import { VerifiedSeal } from '@/components/VerifiedSeal';
import { Avatar, Eyebrow } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { Fonts } from '@/lib/typography';
import { SELF } from '@/lib/mockData';

const STATS = [
  { label: 'Connections', value: String(SELF.connections) },
  { label: 'Intros made', value: String(SELF.introsMade) },
  { label: 'Trust score', value: SELF.trustScore.toFixed(1) },
];

const MENU = [
  { icon: CreditCard, label: 'Edit business card', value: 'Cucu Advertising' },
  { icon: Radar, label: 'Networking radius', value: '10 km' },
  { icon: Clock, label: 'Active hours', value: '9–7' },
];

export default function Profile() {
  const { colors } = useTheme();

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
        <Eyebrow>Your card</Eyebrow>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroShadow, { shadowColor: colors.glow }]}>
          <LinearGradient
            colors={[colors.heroA, colors.heroB]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.hero, { borderColor: colors.glassBorder }]}
          >
            <View style={styles.sealCorner}>
              <VerifiedSeal size={30} />
            </View>

            <Avatar name={SELF.name} size={64} />
            <Text style={[styles.name, { color: colors.text }]}>{SELF.name}</Text>
            <Text style={[styles.role, { color: colors.textDim }]}>{SELF.role}</Text>

            <View style={[styles.stats, { borderTopColor: colors.glassBorder }]}>
              {STATS.map((s) => (
                <View key={s.label} style={styles.stat}>
                  <Text style={[styles.statValue, { color: colors.accent }]}>{s.value}</Text>
                  <Text style={[styles.statLabel, { color: colors.textDim }]}>{s.label.toUpperCase()}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </View>

        <View style={styles.menu}>
          {MENU.map((item, i) => {
            const Icon = item.icon;
            return (
              <PressableScale
                key={item.label}
                scaleTo={0.98}
                style={[
                  styles.menuRow,
                  { borderBottomColor: colors.glassBorder, borderBottomWidth: i < MENU.length - 1 ? StyleSheet.hairlineWidth : 0 },
                ]}
              >
                <View style={[styles.menuIcon, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                  <Icon size={19} color={colors.text} strokeWidth={2} />
                </View>
                <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
                <Text style={[styles.menuValue, { color: colors.textDim }]}>{item.value}</Text>
                <ChevronRight size={18} color={colors.textFaint} strokeWidth={2} />
              </PressableScale>
            );
          })}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  title: { fontFamily: Fonts.displayBold, fontSize: 28 },
  body: { paddingHorizontal: 20, paddingBottom: 40 },
  heroShadow: { shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.5, shadowRadius: 24, borderRadius: 26 },
  hero: { borderRadius: 26, padding: 22, borderWidth: 1, overflow: 'hidden' },
  sealCorner: { position: 'absolute', top: 18, right: 18 },
  name: { fontFamily: Fonts.displayBold, fontSize: 23, marginTop: 16 },
  role: { fontFamily: Fonts.bodyRegular, fontSize: 14.5, marginTop: 4 },
  stats: { flexDirection: 'row', marginTop: 22, paddingTop: 20, borderTopWidth: StyleSheet.hairlineWidth },
  stat: { flex: 1 },
  statValue: { fontFamily: Fonts.displayBold, fontSize: 24 },
  statLabel: { fontFamily: Fonts.monoRegular, fontSize: 9.5, letterSpacing: 0.8, marginTop: 4 },
  menu: { marginTop: 26 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 14 },
  menuIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  menuLabel: { fontFamily: Fonts.bodyMedium, fontSize: 15.5, flex: 1 },
  menuValue: { fontFamily: Fonts.monoRegular, fontSize: 12.5, marginRight: 4 },
});
