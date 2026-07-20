/**
 * Design Token System
 *
 * Single source of truth for all design values.
 * Import as: import { theme } from '../../theme';
 *
 * Palette: Obsidian & Rhodium (black and platinum, steel blue accent)
 * Reference: Old_Ageless_Web_PWA/fitness-app-next/tailwind.config.ts
 */

// ═══════════════════════════════════════════════════════════════════════════
// COLOR TOKENS
// ═══════════════════════════════════════════════════════════════════════════

export const colors = {
  // Primary brand color (Rhodium Silver) - used as fill for primary buttons/controls
  primary: '#D4D6D9',
  primaryHover: '#B9BBBE',    // Darker platinum for press states
  primaryLight: '#1E2830',    // Muted steel tint, for selected/highlighted backgrounds

  // Accent (Steel Blue) - links, icon accents, emphasis values, progress fill
  accent: '#5B7A93',
  accentHover: '#4A6478',     // Darker steel for press states / mid-tone borders
  accentMuted: '#9FB4C4',     // Soft steel - save confirmations, legible accent text on dark

  // Neutral backgrounds (Obsidian & Rhodium)
  background: '#0B0B0D',      // Main app background (Obsidian)
  surface: '#18181B',         // Card/modal background (Graphite Black)
  surfaceAlt: '#212124',      // Header/nav/input elevated surface

  // Text colors
  text: {
    primary: '#D4D6D9',       // Main body text (Rhodium Silver)
    secondary: '#909295',     // Muted/secondary text (Pewter Grey)
    onPrimary: '#0B0B0D',     // Text on platinum-filled buttons
  },

  // Border colors
  border: {
    light: '#3A3B3E',         // Subtle dividers
    strong: '#4A4B4E',        // Prominent dividers
  },

  // Status colors
  status: {
    success: '#4A6478',       // Completed exercises (mid steel) - was green
    warning: '#8B7355',       // Pending/in progress (muted brass) - was amber
    error: '#8B4A46',         // Missed/errors/destructive (muted brick red) - was bright red
    info: '#5B7A93',          // Information (steel blue) - was bright blue
  },

  // Interactive
  overlay: 'rgba(0,0,0,0.65)', // Modal overlay (semi-transparent black)
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SPACING TOKENS (4px base scale)
// ═══════════════════════════════════════════════════════════════════════════

export const spacing = {
  xs: 4,      // Extra small (1x)
  sm: 8,      // Small (2x) - Web PWA text label margin
  base: 8,    // Base unit (2x 4px)
  md: 12,     // Medium (3x 4px)
  lg: 16,     // Large (4x 4px)
  xl: 20,     // Extra large (5x 4px) - Web PWA gap-5 for cards
  '2xl': 24,  // 2x large (6x 4px)
  '3xl': 32,  // 3x large (8x 4px)

  // Semantic spacing tokens (Web PWA specific)
  cardPadding: 20,          // p-5 in Web PWA (card internal padding)
  sectionPadding: 24,       // p-6 in Web PWA (progress section padding)
  sectionSpacing: 24,       // space-y-6 in Web PWA (gap between major sections)
  internalCardGap: 12,      // gap-3 in Web PWA (gap between card elements)
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT SIZE TOKENS
// ═══════════════════════════════════════════════════════════════════════════

export const sizes = {
  // Interactive touch targets (minimum 44x44pt for accessibility)
  touchTarget: 44,
  // Exercise control buttons (matching Web PWA w-11 h-11)
  controlButton: 44,
  // Progress bar height (Web PWA h-3 = 12px, NOT 8px)
  progressBar: 12,
  // Icon sizes
  iconSmall: 16,
  iconMedium: 24,
  iconLarge: 32,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// BORDER RADIUS TOKENS
// ═══════════════════════════════════════════════════════════════════════════

export const radius = {
  sm: 4,      // Slightly rounded (inputs, small elements)
  md: 8,      // Rounded (chips, borders)
  button: 14, // Web PWA button radius (rounded-[14px])
  lg: 12,     // Progress section (rounded-xl)
  card: 20,   // Exercise cards - increased for softer appearance
  xl: 20,     // Pill-shaped (badges, progress banner)
  '2xl': 24,  // Very rounded
  full: 999,  // Circle
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SHADOW TOKENS (React Native compatible)
// ═══════════════════════════════════════════════════════════════════════════

export const shadows = {
  // Card shadow: Web PWA "0 4px 12px rgba(0,0,0,0.08)"
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,        // CHANGED from 0.05 to match Web PWA
    shadowRadius: 3,            // CHANGED from 4 (approximates 12px blur)
    elevation: 2,
  },
  // Button shadow: Web PWA "0 4px 10px rgba(0,0,0,0.12)"
  // (used for control buttons)
  button: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,        // NEW: Higher than card shadow
    shadowRadius: 2.5,          // NEW: Tighter blur approximates 10px
    elevation: 3,
  },
  // Completed card shadow: Web PWA "0 4px 18px rgba(49,162,76,0.25)"
  // (steel-tinted shadow for completed exercises)
  completedCard: {
    shadowColor: '#4A6478',     // STEEL color for completed state
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,        // NEW: Much darker for emphasis
    shadowRadius: 4.5,          // NEW: Larger blur radius (18px approximation)
    elevation: 5,
  },
  md: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// TYPOGRAPHY TOKENS
// ═══════════════════════════════════════════════════════════════════════════

export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  h2: {
    fontSize: 26,
    fontWeight: '600' as const,
    lineHeight: 30,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// TRANSITION TOKENS (milliseconds)
// ═══════════════════════════════════════════════════════════════════════════

export const transitions = {
  fast: 120,      // Quick feedback (button press, collapse)
  standard: 160,  // Normal transitions (fades, slides)
  slow: 280,      // Complex animations (modals, drawers)
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// THEME OBJECT (Complete theme export)
// ═══════════════════════════════════════════════════════════════════════════

export const theme = {
  colors,
  spacing,
  sizes,
  radius,
  shadows,
  typography,
  transitions,
} as const;

export type Theme = typeof theme;
export type Colors = typeof colors;
export type Spacing = typeof spacing;
export type Sizes = typeof sizes;
export type Radius = typeof radius;
export type Shadows = typeof shadows;
export type Typography = typeof typography;
export type Transitions = typeof transitions;

// ═══════════════════════════════════════════════════════════════════════════
// USAGE EXAMPLES
// ═══════════════════════════════════════════════════════════════════════════

/*
 * COLORS:
 * const bgColor = theme.colors.primary;
 * const textColor = theme.colors.text.primary;
 * const statusColor = theme.colors.status.success;
 *
 * SPACING:
 * padding: theme.spacing.lg           // 16px
 * marginBottom: theme.spacing.md      // 12px
 * gap: theme.spacing.base             // 8px
 *
 * RADIUS:
 * borderRadius: theme.radius.lg       // 12px
 * borderRadius: theme.radius.full     // 999px (circle)
 *
 * SHADOWS (spread with ...):
 * ...theme.shadows.md                 // Medium shadow
 *
 * TYPOGRAPHY (spread with ...):
 * ...theme.typography.button          // 16px, semibold
 * ...theme.typography.h1              // 28px, bold
 *
 * TRANSITIONS:
 * duration: theme.transitions.standard // 160ms
 */

export default theme;
