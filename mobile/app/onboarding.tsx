import { useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScalePressable } from '../components/AnimatedUI';
import { useThemeColors } from '../lib/theme';
import { useAuthStore } from '../lib/store';
import { INDUSTRIES } from '../lib/mockData';
import { useReducedMotion } from '../hooks/useReducedMotion';

export default function OnboardingScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const businessName = useAuthStore((s) => s.businessName);
  const setBusinessName = useAuthStore((s) => s.setBusinessName);
  const industry = useAuthStore((s) => s.industry);
  const setIndustry = useAuthStore((s) => s.setIndustry);
  const setOnboarded = useAuthStore((s) => s.setOnboarded);

  const rotation = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    rotation.value = withRepeat(
      withTiming(360, { duration: 6000, easing: Easing.linear }),
      -1,
    );
  }, [reduceMotion, rotation]);

  const avatarRingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const initials = businessName
    ? businessName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '??';

  const handleEnter = () => {
    setOnboarded(true);
    router.replace('/(tabs)/nearby');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.void }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.dots}>
          <View style={[styles.dot, { backgroundColor: colors.accent }]} />
          <View style={[styles.dot, { backgroundColor: colors.accent }]} />
          <View style={[styles.dot, { backgroundColor: colors.textFaint }]} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Build your card</Text>
        <Text style={[styles.subtitle, { color: colors.textDim }]}>
          This is how other verified owners will discover you nearby.
        </Text>

        <View style={styles.avatarContainer}>
          <Animated.View style={[styles.avatarRing, avatarRingStyle]}>
            <LinearGradient
              colors={[colors.holoA, colors.holoB, colors.accent, colors.gradientEnd, colors.holoA]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
          <View style={[styles.avatarInner, { backgroundColor: colors.voidAlt }]}>
            <Text style={[styles.initials, { color: colors.text }]}>{initials}</Text>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textFaint }]}>BUSINESS NAME</Text>
          <TextInput
            value={businessName}
            onChangeText={setBusinessName}
            placeholder="Your company name"
            placeholderTextColor={colors.textFaint}
            style={[
              styles.input,
              {
                color: colors.text,
                backgroundColor: colors.glass,
                borderColor: colors.glassBorder,
              },
            ]}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textFaint }]}>INDUSTRY</Text>
          <View style={styles.chips}>
            {INDUSTRIES.map((item) => {
              const selected = industry === item;
              return (
                <ScalePressable
                  key={item}
                  onPress={() => setIndustry(item)}
                  style={styles.chipWrapper}
                  scaleTo={0.96}
                >
                  {selected ? (
                    <LinearGradient
                      colors={[colors.gradientStart, colors.gradientEnd]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.chip}
                    >
                      <Text style={[styles.chipText, { color: colors.onAccent }]}>{item}</Text>
                    </LinearGradient>
                  ) : (
                    <View
                      style={[
                        styles.chip,
                        {
                          backgroundColor: colors.glass,
                          borderColor: colors.glassBorder,
                          borderWidth: 1,
                        },
                      ]}
                    >
                      <Text style={[styles.chipText, { color: colors.textDim }]}>{item}</Text>
                    </View>
                  )}
                </ScalePressable>
              );
            })}
          </View>
        </View>

        <PrimaryButton
          label="Enter B Square"
          onPress={handleEnter}
          disabled={!businessName.trim() || !industry}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 24,
    gap: 20,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 30,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
    marginTop: -8,
  },
  avatarContainer: {
    alignSelf: 'center',
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  avatarRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
  },
  avatarInner: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28,
  },
  field: {
    gap: 10,
  },
  label: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 1.8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chipWrapper: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  chipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
});
