// Design Tokens for Lyfe App
// This file contains all design constants to ensure visual consistency

export const colors = {
  // Primary Colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  
  // Accent Colors
  accent: {
    yellow: '#FFD200',
    green: '#3CCB7F',
    teal: '#4ECDC4',
    blue: '#0EA5E9',
    purple: '#8B5CF6',
    pink: '#EC4899',
    orange: '#F97316',
    red: '#EF4444',
  },
  
  // Neutral Colors
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  
  // Background Colors
  background: {
    primary: '#0A0C0F',
    secondary: '#11151A',
    tertiary: '#1A1F2E',
    card: '#1E2330',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  
  // Text Colors
  text: {
    primary: '#E8EEF2',
    secondary: '#C9D1D9',
    tertiary: '#94A3B8',
    muted: '#64748B',
    inverse: '#0A0C0F',
  },
  
  // Border Colors
  border: {
    primary: '#2A313A',
    secondary: '#3A414A',
    accent: '#3CCB7F',
    error: '#EF4444',
    success: '#3CCB7F',
    warning: '#F59E0B',
  },
  
  // Status Colors
  status: {
    success: '#3CCB7F',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#0EA5E9',
  }
};

export const typography = {
  // Font Families
  fontFamily: {
    primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    display: 'Oswald, Inter, sans-serif',
    mono: 'JetBrains Mono, "Fira Code", monospace',
  },
  
  // Font Sizes
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
  },
  
  // Font Weights
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  
  // Line Heights
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  
  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  }
};

export const spacing = {
  // Base spacing scale (4px grid)
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
  40: '10rem',    // 160px
  48: '12rem',    // 192px
  56: '14rem',    // 224px
  64: '16rem',    // 256px
};

export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none',
};

export const transitions = {
  // Duration
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  
  // Easing
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  // Common transitions
  common: {
    all: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    colors: 'color 200ms cubic-bezier(0.4, 0, 0.2, 1), background-color 200ms cubic-bezier(0.4, 0, 0.2, 1), border-color 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    shadow: 'box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  }
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
};

// Common component styles
export const componentStyles = {
  // Card styles
  card: {
    base: `
      bg-background-card 
      border border-border-primary 
      rounded-2xl 
      shadow-lg 
      p-6 
      transition-all 
      duration-200 
      hover:shadow-xl 
      hover:border-border-accent/30
    `,
    elevated: `
      bg-background-card 
      border border-border-primary 
      rounded-2xl 
      shadow-xl 
      p-6 
      transition-all 
      duration-200 
      hover:shadow-2xl 
      hover:border-border-accent/50
    `,
    interactive: `
      bg-background-card 
      border border-border-primary 
      rounded-2xl 
      shadow-lg 
      p-6 
      transition-all 
      duration-200 
      hover:shadow-xl 
      hover:border-border-accent/30 
      hover:scale-[1.02] 
      active:scale-[0.98] 
      cursor-pointer
    `,
  },
  
  // Button styles
  button: {
    primary: `
      bg-gradient-to-r from-accent-yellow via-accent-green to-accent-teal 
      text-text-inverse 
      font-semibold 
      px-6 
      py-3 
      rounded-xl 
      transition-all 
      duration-200 
      hover:from-accent-yellow/90 
      hover:via-accent-green/90 
      hover:to-accent-teal/90 
      hover:scale-[1.02] 
      active:scale-[0.98] 
      shadow-lg 
      hover:shadow-xl
    `,
    secondary: `
      bg-background-secondary 
      border border-border-primary 
      text-text-primary 
      font-medium 
      px-6 
      py-3 
      rounded-xl 
      transition-all 
      duration-200 
      hover:bg-background-tertiary 
      hover:border-border-accent/50 
      hover:scale-[1.02] 
      active:scale-[0.98]
    `,
    ghost: `
      text-text-primary 
      font-medium 
      px-4 
      py-2 
      rounded-lg 
      transition-all 
      duration-200 
      hover:bg-background-secondary 
      hover:text-text-secondary
    `,
    outline: `
      bg-transparent 
      border border-border-primary 
      text-text-primary 
      font-medium 
      px-6 
      py-3 
      rounded-xl 
      transition-all 
      duration-200 
      hover:bg-background-secondary 
      hover:border-border-accent/50 
      hover:scale-[1.02] 
      active:scale-[0.98]
    `,
    default: `
      bg-background-secondary 
      border border-border-primary 
      text-text-primary 
      font-medium 
      px-6 
      py-3 
      rounded-xl 
      transition-all 
      duration-200 
      hover:bg-background-tertiary 
      hover:border-border-accent/50 
      hover:scale-[1.02] 
      active:scale-[0.98]
    `,
  },
  
  // Input styles
  input: {
    base: `
      bg-background-secondary 
      border border-border-primary 
      text-text-primary 
      placeholder:text-text-muted 
      px-4 
      py-3 
      rounded-xl 
      transition-all 
      duration-200 
      focus:outline-none 
      focus:ring-2 
      focus:ring-accent-green/50 
      focus:border-accent-green 
      hover:border-border-secondary
    `,
  },
  
  // Badge styles
  badge: {
    base: `
      inline-flex 
      items-center 
      px-3 
      py-1 
      rounded-full 
      text-xs 
      font-medium 
      transition-colors 
      duration-200
    `,
    default: `
      bg-background-secondary 
      text-text-primary 
      border border-border-primary
    `,
    secondary: `
      bg-background-tertiary 
      text-text-secondary 
      border border-border-secondary
    `,
    outline: `
      bg-transparent 
      text-text-primary 
      border border-border-primary
    `,
    success: `
      bg-status-success/20 
      text-status-success 
      border border-status-success/30
    `,
    error: `
      bg-status-error/20 
      text-status-error 
      border border-status-error/30
    `,
    warning: `
      bg-status-warning/20 
      text-status-warning 
      border border-status-warning/30
    `,
    info: `
      bg-status-info/20 
      text-status-info 
      border border-status-info/30
    `,
  },
  
  // Section styles
  section: {
    base: `
      bg-background-primary 
      min-h-screen 
      py-8 
      px-4 
      sm:px-6 
      lg:px-8
    `,
    container: `
      max-w-7xl 
      mx-auto 
      space-y-8
    `,
  },
  
  // Header styles
  header: {
    base: `
      text-text-primary 
      font-display 
      font-bold 
      tracking-wide
    `,
    h1: `
      text-4xl 
      sm:text-5xl 
      lg:text-6xl
    `,
    h2: `
      text-3xl 
      sm:text-4xl 
      lg:text-5xl
    `,
    h3: `
      text-2xl 
      sm:text-3xl 
      lg:text-4xl
    `,
    h4: `
      text-xl 
      sm:text-2xl 
      lg:text-3xl
    `,
  },
  
  // Text styles
  text: {
    base: `
      text-text-primary 
      font-primary
    `,
    body: `
      text-base 
      leading-relaxed
    `,
    large: `
      text-lg 
      leading-relaxed
    `,
    small: `
      text-sm 
      leading-relaxed
    `,
    muted: `
      text-text-muted 
      font-medium
    `,
  }
};

// Animation variants for framer-motion
export const animations = {
  // Fade animations
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 }
  },
  
  // Slide animations
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  
  // Scale animations
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  
  // Interactive animations
  hover: {
    scale: 1.02,
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  
  tap: {
    scale: 0.98,
    transition: { duration: 0.1, ease: 'easeOut' }
  },
  
  // Stagger animations for lists
  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }
};


