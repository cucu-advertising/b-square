import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BusinessCard } from '../../components/BusinessCard';
import { showToast } from '../../components/Toast';
import { useFocusPointerEvents } from '../../hooks/useFocusPointerEvents';
import { fonts } from '../../lib/fonts';
import { BUSINESSES } from '../../lib/mockData';
import { useTheme } from '../../lib/theme';

export default function NearbyScreen() {
  const theme = useTheme();
  const pointerEvents = useFocusPointerEvents();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.void, pointerEvents }]}
      edges={['top']}
    >
      <View style={styles.header}>
        <Text style={[styles.wordmark, { color: theme.colors.text }]}>B²</Text>
        <View
          style={[
            styles.locationPill,
            { backgroundColor: theme.colors.glass, borderColor: theme.colors.glassBorder },
          ]}
        >
          <View style={[styles.liveDot, { backgroundColor: theme.colors.accent }]} />
          <Text style={[styles.locationText, { color: theme.colors.textDim }]}>SECUNDERABAD</Text>
        </View>
      </View>

      <FlatList
        data={BUSINESSES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: theme.colors.textFaint }]}>
              NEARBY · VERIFIED
            </Text>
            <Text style={[styles.sectionCount, { color: theme.colors.textFaint }]}>14 TODAY</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <BusinessCard
            business={item}
            index={index}
            onConnect={() => showToast(`Request sent to ${item.name.split(' ')[0]} ✓`)}
          />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
  },
  wordmark: {
    fontFamily: fonts.display700,
    fontSize: 22,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  locationText: {
    fontFamily: fonts.mono500,
    fontSize: 11,
    letterSpacing: 0.8,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 14,
  },
  sectionLabel: {
    fontFamily: fonts.mono500,
    fontSize: 11.5,
    letterSpacing: 1.2,
  },
  sectionCount: {
    fontFamily: fonts.mono400,
    fontSize: 11.5,
    letterSpacing: 0.8,
  },
});
