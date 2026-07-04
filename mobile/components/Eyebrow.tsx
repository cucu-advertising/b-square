import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle } from 'react-native';
import { fonts } from '../lib/fonts';
import { useTheme } from '../lib/theme';

type Props = {
  children: React.ReactNode;
  color?: string;
  style?: StyleProp<TextStyle>;
};

/** Mono, uppercase, letter-spaced label used for eyebrows / section headers. */
export function Eyebrow({ children, color, style }: Props) {
  const theme = useTheme();
  return (
    <Text style={[styles.text, { color: color ?? theme.colors.accent }, style]}>{children}</Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: fonts.mono500,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
});
