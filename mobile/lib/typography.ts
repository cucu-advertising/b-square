/**
 * Font family names as registered by @expo-google-fonts.
 * Display/headings -> Space Grotesk, Body/UI -> Inter, Data/labels -> JetBrains Mono.
 */
export const Fonts = {
  displayMedium: 'SpaceGrotesk_500Medium',
  displaySemiBold: 'SpaceGrotesk_600SemiBold',
  displayBold: 'SpaceGrotesk_700Bold',

  bodyRegular: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',

  monoRegular: 'JetBrainsMono_400Regular',
  monoMedium: 'JetBrainsMono_500Medium',
} as const;

/** Letter spacing tuned for uppercase mono eyebrow labels (~0.08–0.14em). */
export const eyebrow = {
  fontFamily: Fonts.monoMedium,
  textTransform: 'uppercase' as const,
  letterSpacing: 1.6,
  fontSize: 11,
};
