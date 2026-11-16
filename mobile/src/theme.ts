import { Platform, TextStyle } from 'react-native';

export const colors = {
  primary: '#143C5F', // navy
  primaryDark: '#0D2A44',
  primarySoft: '#E7EEF5',
  accent: '#E36010', // orange
  accentLight: '#F28A25',
  accentSoft: '#FDEFE5',
  danger: '#D32F2F',
  dangerSoft: '#FDECEC',
  success: '#1E8E5A',
  successSoft: '#E5F5EC',
  warning: '#B7791F',
  warningSoft: '#FFF6E0',
  info: '#2563EB',
  infoSoft: '#E8F0FE',
  bg: '#F4F6F9',
  surface: '#FFFFFF',
  border: '#E3E8EF',
  text: '#13212F',
  textMuted: '#5D6B7A',
  textFaint: '#94A1AF',
  white: '#FFFFFF',
  overlay: 'rgba(10, 22, 35, 0.5)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
} as const;

const base: TextStyle = { color: colors.text };

export const typography = {
  h1: { ...base, fontSize: 26, fontWeight: '800', letterSpacing: -0.3 },
  h2: { ...base, fontSize: 20, fontWeight: '700' },
  h3: { ...base, fontSize: 17, fontWeight: '700' },
  body: { ...base, fontSize: 15, fontWeight: '400', lineHeight: 21 },
  bodyStrong: { ...base, fontSize: 15, fontWeight: '600' },
  small: { ...base, fontSize: 13, color: colors.textMuted, lineHeight: 18 },
  caption: { ...base, fontSize: 11, fontWeight: '600', color: colors.textMuted, letterSpacing: 0.4 },
} satisfies Record<string, TextStyle>;

export const shadow = Platform.select({
  web: { boxShadow: '0 2px 10px rgba(20, 60, 95, 0.08)' } as object,
  default: {
    shadowColor: '#143C5F',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});

export const theme = { colors, spacing, radius, typography, shadow };
export default theme;
