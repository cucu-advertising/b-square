import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { PressableScale } from './PressableScale';
import { useTheme } from '@/lib/theme';
import { Fonts } from '@/lib/typography';

type Props = {
  label: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
};

/** Secondary action: glass-bordered ghost button. */
export function GhostButton({ label, onPress, style, icon }: Props) {
  const { colors } = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      style={[
        styles.inner,
        { borderColor: colors.glassBorder, backgroundColor: colors.glass },
        style,
      ]}
    >
      <View style={styles.row}>
        {icon}
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  inner: {
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontFamily: Fonts.bodySemiBold, fontSize: 15, letterSpacing: 0.2 },
});
