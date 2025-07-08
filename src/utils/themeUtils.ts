// Theme utility functions for consistent styling

export const themeClasses = {
  // Background combinations
  backgrounds: {
    primary: "bg-background-primary",
    secondary: "bg-background-secondary",
    tertiary: "bg-background-tertiary",
    card: "bg-background-primary shadow-lg rounded-2xl",
    gradient: "bg-gradient-to-r from-primary-50 to-primary-100",
  },

  // Text combinations
  text: {
    primary: "text-text-primary font-inter",
    secondary: "text-text-secondary font-inter",
    tertiary: "text-text-tertiary font-inter",
    heading: "text-text-primary font-heading font-semibold",
    code: "text-text-primary font-mono",
  },

  // Button variants
  buttons: {
    primary:
      "bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg shadow-md transition-colors duration-normal",
    secondary:
      "bg-neutral-200 hover:bg-neutral-300 text-text-primary font-medium py-3 px-6 rounded-lg shadow-md transition-colors duration-normal",
    success:
      "bg-semantic-success hover:bg-green-600 text-white font-medium py-3 px-6 rounded-lg shadow-md transition-colors duration-normal",
    danger:
      "bg-semantic-error hover:bg-red-600 text-white font-medium py-3 px-6 rounded-lg shadow-md transition-colors duration-normal",
    ghost:
      "text-primary-600 hover:text-primary-700 hover:bg-primary-50 font-medium py-3 px-6 rounded-lg transition-colors duration-normal",
  },

  // Input variants
  inputs: {
    default:
      "border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
    error:
      "border border-semantic-error rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-semantic-error focus:border-transparent",
    success:
      "border border-semantic-success rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-semantic-success focus:border-transparent",
  },

  // Card variants
  cards: {
    default: "bg-background-primary rounded-2xl p-6 shadow-lg",
    bordered:
      "bg-background-primary rounded-2xl p-6 shadow-lg border border-neutral-200",
    interactive:
      "bg-background-primary rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-normal cursor-pointer",
    primary:
      "bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-6 shadow-lg border border-primary-200",
  },

  // Layout utilities
  layout: {
    container: "max-w-6xl mx-auto px-4",
    section: "py-12",
    grid: "grid gap-8",
    flex: "flex items-center justify-center",
    spacing: "space-y-6",
  },

  // Animation utilities
  animations: {
    fadeIn: "animate-fade-in",
    slideUp: "animate-slide-up",
    bounce: "animate-bounce",
    pulse: "animate-pulse",
  },
} as const;

// Helper function to combine classes
export const cn = (
  ...classes: (string | undefined | false | null)[]
): string => {
  return classes.filter(Boolean).join(" ");
};

// Color palette for programmatic access
export const colors = {
  primary: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
  },
  neutral: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },
  semantic: {
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
  },
} as const;

// Font families
export const fonts = {
  inter:
    'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  heading: "Playfair Display, Georgia, serif",
  mono: 'SF Mono, Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
} as const;

// Breakpoints for responsive design
export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

// Theme configuration type
export type ThemeConfig = {
  colors: typeof colors;
  fonts: typeof fonts;
  breakpoints: typeof breakpoints;
  classes: typeof themeClasses;
};

// Export complete theme configuration
export const theme: ThemeConfig = {
  colors,
  fonts,
  breakpoints,
  classes: themeClasses,
};

export default theme;
