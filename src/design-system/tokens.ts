/**
 * INCROUTE DESIGN TOKENS — TypeScript export
 * Mirror of tokens.css for use in JS (charts, inline styles, motion).
 */

export const colors = {
  bgPrimary: "#0F172A",
  bgSecondary: "#18253D",
  surfacePrimary: "#1B263B",
  surfaceSecondary: "#14213D",
  surfaceElevated: "#22304A",
  surfaceSunken: "#0B1120",

  workspaceBg: "#F8FAFC",
  workspaceSurface: "#FFFFFF",
  workspaceBorder: "#E2E8F0",

  textPrimary: "#F8FAFC",
  textSecondary: "#CBD5E1",
  textMuted: "#94A3B8",

  borderPrimary: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.14)",

  brandPrimary: "#6C7CFF",
  brandPrimaryHover: "#5B6CFF",
  brandSecondary: "#A78BFA",
  brandPremium: "#D4AF37",

  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
} as const;

export const spacing = {
  0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 24, 6: 32, 7: 48, 8: 64, 9: 96, 10: 128,
} as const;

export const radius = {
  xs: 4, sm: 6, md: 8, lg: 12, xl: 16, "2xl": 20, "3xl": 28, full: 9999,
} as const;

export const motion = {
  durationInstant: 0.08,
  durationFast: 0.15,
  durationMedium: 0.25,
  durationSlow: 0.4,
  easeStandard: [0.4, 0, 0.2, 1] as [number, number, number, number],
  easeSnappy: [0.16, 1, 0.3, 1] as [number, number, number, number],
} as const;

export const breakpoints = {
  sm: 640, md: 768, lg: 1024, xl: 1280, "2xl": 1536,
} as const;

export const layout = {
  contentMax: 1200,
  sidebarWidth: 260,
  sidebarCollapsed: 72,
  headerHeight: 64,
} as const;

export const tokens = { colors, spacing, radius, motion, breakpoints, layout };
export default tokens;
