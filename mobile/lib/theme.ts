import { create } from 'zustand';

export type Theme = {
  key: string;
  label: string;
  tag: string;
  colors: {
    void: string; voidAlt: string; surface: string; glass: string;
    glassBorder: string; gradientStart: string; gradientEnd: string;
    accent: string; coral: string; holoA: string; holoB: string;
    text: string; textDim: string; textFaint: string; onAccent: string;
    heroA: string; heroB: string; glow: string; glowSoft: string;
  };
};

// Palette transcribed from the user-approved 21-screen Opal-inspired Bsquare pack.
// The application keeps one intentional identity instead of a user-selectable theme gallery.
export const BSQUARE = {
  blue: '#0B2980',
  deepBlue: '#061B53',
  blueAlt: '#09236D',
  card: '#123586',
  field: '#081F5B',
  lime: '#DFFF73',
  white: '#FAFBFF',
  muted: '#B7C8EC',
  outline: '#33549F',
} as const;

export const THEMES: Theme[] = [{
  key: 'bsquare',
  label: 'B Square · Royal Blue',
  tag: 'Royal blue · neon lime · Ubuntu',
  colors: {
    void: BSQUARE.blue,
    voidAlt: BSQUARE.blueAlt,
    surface: BSQUARE.card,
    glass: BSQUARE.card,
    glassBorder: BSQUARE.outline,
    gradientStart: BSQUARE.lime,
    gradientEnd: BSQUARE.lime,
    accent: BSQUARE.lime,
    coral: '#FF969A',
    holoA: '#9BC4FF',
    holoB: BSQUARE.lime,
    text: BSQUARE.white,
    textDim: BSQUARE.muted,
    textFaint: '#92ADE8',
    onAccent: BSQUARE.deepBlue,
    heroA: BSQUARE.card,
    heroB: BSQUARE.blueAlt,
    glow: 'rgba(223,255,115,0.17)',
    glowSoft: 'rgba(223,255,115,0.08)',
  },
}];

export const DEFAULT_THEME_KEY = 'bsquare';
export function getThemeByKey(_key: string): Theme { return THEMES[0]; }

type ThemeState = {
  activeThemeKey: string;
  theme: Theme;
  setTheme: (key: string) => void;
};
export const useThemeStore = create<ThemeState>((set) => ({
  activeThemeKey: DEFAULT_THEME_KEY,
  theme: THEMES[0],
  setTheme: (_key) => set({ activeThemeKey: DEFAULT_THEME_KEY, theme: THEMES[0] }),
}));
export function useTheme() { return useThemeStore((s) => s.theme); }
export function useThemeColors() { return useThemeStore((s) => s.theme.colors); }
