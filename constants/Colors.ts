export const Colors = {
  // The Layered Minimal palette
  background: "#FFFFFF",           // Pure white
  backgroundSoft: "#F8F6F3",       // Soft off-white for screen backgrounds
  text: "#000000",                 // Black text
  border: "#000000",               // Black border for line-centered design
  borderLight: "#E5E7EB",          // Light gray for subtle separators
  textMuted: "#6B7280",            // Gray muted text

  // Primary - Apricot (warmer, richer)
  primary: "#E88D67",              // Active tabs, main buttons

  // Secondary - Light Beige
  secondary: "#F3E9D2",            // Gradient start, secondary backgrounds

  // Accent 1 - Muted Teal
  accent1: "#8FB9B8",              // Secondary point, icon backgrounds

  // Accent 2 - Deep Blue
  accent2: "#5C9EAD",              // Deep emphasis, icon backgrounds

  // Tab Bar
  tabInactive: "#999999",          // Inactive tab color

  // Skeleton
  skeleton: "#E8E8E8",             // Skeleton base color
  skeletonHighlight: "#F5F5F5",    // Skeleton highlight color

  // Legacy aliases for compatibility
  accent: "#E88D67",               // Same as primary
  card: "#FFFFFF",
  cardSolid: "#FFFFFF",
};

// Level-based colors for asana icons (Warm Minimal palette: Beige + Apricot only)
export const LEVEL_COLORS = {
  beginner: Colors.secondary,      // Light Beige
  intermediate: Colors.secondary,  // Light Beige
  advanced: Colors.primary,        // Apricot
  expert: Colors.primary,          // Apricot
};

export const theme = {
  colors: Colors,
  // Spacing increased by 20% for minimal aesthetic
  spacing: {
    xs: 5,
    sm: 10,
    md: 19,
    lg: 29,
    xl: 38,
  },
  borderRadius: {
    sm: 8,
    md: 16,
    lg: 24,
    full: 9999,
  },
};

export default Colors;
