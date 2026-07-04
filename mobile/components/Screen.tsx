import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useTheme } from '@/lib/theme';

type Props = {
  children: React.ReactNode;
  edges?: readonly Edge[];
  style?: StyleProp<ViewStyle>;
};

/** Themed screen background (void → voidAlt) with safe-area padding. */
export function Screen({ children, edges = ['top'], style }: Props) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.void }}>
      <LinearGradient
        colors={[colors.voidAlt, colors.void]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.6 }}
      />
      <SafeAreaView style={[{ flex: 1 }, style]} edges={edges}>
        {children}
      </SafeAreaView>
    </View>
  );
}
