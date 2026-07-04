import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export type ThemeColors = {
  void: string; // app background
  voidAlt: string; // secondary background / hero gradient stop
  surface: string; // card surface base
  glass: string; // translucent card fill (rgba)
  glassBorder: string; // translucent card border (rgba)
  gradientStart: string; // primary gradient stop 1
  gradientEnd: string; // primary gradient stop 2
  accent: string; // CTA color — used ONLY for primary actions (Connect, Accept, verified checks)
  coral: string; // alerts / notification dots only
  holoA: string;
  holoB: string; // conic gradient stops for the verified "seal"
  text: string;
  textDim: string;
  textFaint: string;
  onAccent: string; // text/icon color placed on top of `accent`
  heroA: string;
  heroB: string; // hero card gradient (profile hero, self-card)
  glow: string;
  glowSoft: string; // rgba glow used in shadows / focus rings
};

export type Theme = {
  key: string;
  label: string;
  tag: string;
  colors: ThemeColors;
};

export const THEMES: Theme[] = [
  {
    key: 'signal',
    label: 'Signal',
    tag: 'Indigo · dark tech',
    colors: {
      void: '#0A0A10',
      voidAlt: '#111119',
      surface: '#16161F',
      glass: 'rgba(255,255,255,0.045)',
      glassBorder: 'rgba(255,255,255,0.09)',
      gradientStart: '#7B5CFA',
      gradientEnd: '#4F8CFF',
      accent: '#C8FF4D',
      coral: '#FF6A5C',
      holoA: '#B9C7FF',
      holoB: '#F3C7FF',
      text: '#F3F2F8',
      textDim: '#9A96AE',
      textFaint: '#5F5C72',
      onAccent: '#0A0A10',
      heroA: '#1B1730',
      heroB: '#0F1220',
      glow: 'rgba(123,92,250,0.35)',
      glowSoft: 'rgba(123,92,250,0.18)',
    },
  },
  {
    key: 'arctic',
    label: 'Arctic',
    tag: 'Blue · clean & light',
    colors: {
      void: '#F5F7FB',
      voidAlt: '#EDF1F7',
      surface: '#FFFFFF',
      glass: 'rgba(15,23,42,0.035)',
      glassBorder: 'rgba(15,23,42,0.09)',
      gradientStart: '#2563EB',
      gradientEnd: '#7C3AED',
      accent: '#059669',
      coral: '#DC2626',
      holoA: '#93C5FD',
      holoB: '#C4B5FD',
      text: '#0F172A',
      textDim: '#475569',
      textFaint: '#94A3B8',
      onAccent: '#FFFFFF',
      heroA: '#E8EEFC',
      heroB: '#F5F3FF',
      glow: 'rgba(37,99,235,0.18)',
      glowSoft: 'rgba(37,99,235,0.12)',
    },
  },
  {
    key: 'ledger',
    label: 'Ledger',
    tag: 'Gold · quiet luxury',
    colors: {
      void: '#11141C',
      voidAlt: '#171B24',
      surface: '#1B1F29',
      glass: 'rgba(255,255,255,0.04)',
      glassBorder: 'rgba(255,255,255,0.08)',
      gradientStart: '#C9A227',
      gradientEnd: '#E8CD82',
      accent: '#2F9E76',
      coral: '#B4483A',
      holoA: '#E8CD82',
      holoB: '#F3E3B0',
      text: '#F3F1EA',
      textDim: '#A8A296',
      textFaint: '#6B6659',
      onAccent: '#0B120E',
      heroA: '#241F14',
      heroB: '#161310',
      glow: 'rgba(201,162,39,0.3)',
      glowSoft: 'rgba(201,162,39,0.16)',
    },
  },
  {
    key: 'sunset',
    label: 'Sunset',
    tag: 'Coral · warm night',
    colors: {
      void: '#160F1A',
      voidAlt: '#1D1420',
      surface: '#221828',
      glass: 'rgba(255,255,255,0.045)',
      glassBorder: 'rgba(255,255,255,0.09)',
      gradientStart: '#FF6B6B',
      gradientEnd: '#FFA36B',
      accent: '#3DDC97',
      coral: '#FF4D8D',
      holoA: '#FFB199',
      holoB: '#FFD9A0',
      text: '#F7EFF2',
      textDim: '#C2A9B4',
      textFaint: '#83687A',
      onAccent: '#0B140E',
      heroA: '#2A1830',
      heroB: '#170F1C',
      glow: 'rgba(255,107,107,0.3)',
      glowSoft: 'rgba(255,107,107,0.16)',
    },
  },
  {
    key: 'mono',
    label: 'Mono',
    tag: 'Blue · monochrome',
    colors: {
      void: '#000000',
      voidAlt: '#0A0A0A',
      surface: '#111111',
      glass: 'rgba(255,255,255,0.05)',
      glassBorder: 'rgba(255,255,255,0.1)',
      gradientStart: '#3B82F6',
      gradientEnd: '#60A5FA',
      accent: '#3B82F6',
      coral: '#F43F5E',
      holoA: '#93C5FD',
      holoB: '#E4E4E7',
      text: '#FFFFFF',
      textDim: '#A1A1AA',
      textFaint: '#52525B',
      onAccent: '#FFFFFF',
      heroA: '#141414',
      heroB: '#0A0A0A',
      glow: 'rgba(59,130,246,0.3)',
      glowSoft: 'rgba(59,130,246,0.16)',
    },
  },
];

const DEFAULT_THEME_KEY = 'signal';
const STORAGE_KEY = 'bsquare.theme';

type ThemeStore = {
  themeKey: string;
  theme: Theme;
  hydrated: boolean;
  setTheme: (key: string) => void;
  hydrate: () => Promise<void>;
};

function findTheme(key: string): Theme {
  return THEMES.find((t) => t.key === key) ?? THEMES[0];
}

export const useThemeStore = create<ThemeStore>((set) => ({
  themeKey: DEFAULT_THEME_KEY,
  theme: findTheme(DEFAULT_THEME_KEY),
  hydrated: false,
  setTheme: (key: string) => {
    set({ themeKey: key, theme: findTheme(key) });
    AsyncStorage.setItem(STORAGE_KEY, key).catch(() => {});
  },
  hydrate: async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        set({ themeKey: saved, theme: findTheme(saved) });
      }
    } catch {
      // ignore, fall back to default
    } finally {
      set({ hydrated: true });
    }
  },
}));

export function useTheme(): Theme {
  return useThemeStore((s) => s.theme);
}
