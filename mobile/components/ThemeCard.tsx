import { LinearGradient } from 'expo-linear-gradient';
import { Check } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { usePressScale } from '../hooks/usePressScale';
import { fonts } from '../lib/fonts';
import { Theme, useTheme } from '../lib/theme';

type Props = {
  themeOption: Theme;
  active: boolean;
  onPress: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ThemeCard({ themeOption, active, onPress }: Props) {
  const theme = useTheme();
  const { style: pressStyle, onPressIn, onPressOut } = usePressScale(0.97);

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[pressStyle, styles.wrapper]}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: themeOption.colors.surface,
            borderColor: active ? themeOption.colors.accent : theme.colors.glassBorder,
            borderWidth: active ? 2 : 1,
          },
        ]}
      >
        <LinearGradient
          colors={[themeOption.colors.gradientStart, themeOption.colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.previewBar}
        />
        {active && (
          <View style={[styles.checkBadge, { backgroundColor: themeOption.colors.accent }]}>
            <Check size={12} color={themeOption.colors.onAccent} strokeWidth={3} />
          </View>
        )}
        <Text style={[styles.label, { color: themeOption.colors.text }]}>{themeOption.label}</Text>
        <Text style={[styles.tag, { color: themeOption.colors.textDim }]}>{themeOption.tag}</Text>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '48%',
  },
  card: {
    borderRadius: 20,
    padding: 14,
    gap: 10,
  },
  previewBar: {
    height: 36,
    borderRadius: 12,
  },
  checkBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.display600,
    fontSize: 16,
  },
  tag: {
    fontFamily: fonts.mono400,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
