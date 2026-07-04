import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BusinessCard } from '../../components/BusinessCard';
import { useThemeColors } from '../../lib/theme';
import { NEARBY_BUSINESSES, LOCATION_LABEL, NEARBY_COUNT_TODAY } from '../../lib/mockData';

export default function NearbyScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.void }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.wordmark, { color: colors.text }]}>B²</Text>
          <View
            style={[
              styles.locationPill,
              {
                backgroundColor: colors.glass,
                borderColor: colors.glassBorder,
              },
            ]}
          >
            <View style={[styles.liveDot, { backgroundColor: colors.accent }]} />
            <Text style={[styles.locationText, { color: colors.textDim }]}>
              {LOCATION_LABEL}
            </Text>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={[styles.sectionLabel, { color: colors.textFaint }]}>
            NEARBY · VERIFIED
          </Text>
          <Text style={[styles.sectionCount, { color: colors.textFaint }]}>
            {NEARBY_COUNT_TODAY} today
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {NEARBY_BUSINESSES.map((business, index) => (
          <BusinessCard key={business.id} business={business} index={index} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    gap: 20,
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordmark: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  locationText: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
    letterSpacing: 1.4,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLabel: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
    letterSpacing: 1.6,
  },
  sectionCount: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 0.8,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 14,
  },
});
