import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { Screen } from '@/components/Screen';
import { BusinessCard } from '@/components/BusinessCard';
import { Eyebrow } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { Fonts } from '@/lib/typography';
import { PROFILES } from '@/lib/mockData';

export default function Nearby() {
  const { colors } = useTheme();

  return (
    <Screen>
      <FlatList
        data={PROFILES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.topRow}>
              <Text style={[styles.wordmark, { color: colors.text }]}>B Square</Text>
              <View style={[styles.locationPill, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                <MapPin size={13} color={colors.textDim} strokeWidth={2} />
                <View style={[styles.liveDot, { backgroundColor: colors.accent }]} />
                <Text style={[styles.locationText, { color: colors.textDim }]}>SECUNDERABAD</Text>
              </View>
            </View>

            <View style={styles.sectionRow}>
              <Eyebrow>Nearby · Verified</Eyebrow>
              <Text style={[styles.count, { color: colors.textFaint }]}>14 TODAY</Text>
            </View>
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={{ marginBottom: 14 }}>
            <BusinessCard profile={item} index={index} />
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  header: { paddingTop: 8, paddingBottom: 18 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wordmark: { fontFamily: Fonts.displayBold, fontSize: 24, letterSpacing: 0.3 },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  locationText: { fontFamily: Fonts.monoMedium, fontSize: 10.5, letterSpacing: 0.8 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 26 },
  count: { fontFamily: Fonts.monoMedium, fontSize: 11, letterSpacing: 1 },
});
