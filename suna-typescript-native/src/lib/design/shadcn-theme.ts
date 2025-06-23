/**
 * shadcn/ui Theme Overrides
 * Implements Opulentia Design Language specifications
 */

export interface ComponentConfig {
  base: string;
  variants: Record<string, string>;
  sizes: Record<string, string>;
}

// Button Component Overrides
export const button = {
  base: "inline-flex items-center justify-center rounded-[var(--radius)] font-semibold transition-all duration-[var(--motion-micro)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--odl-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--odl-background)]",
  variants: {
    default: "bg-[--odl-button] text-[--odl-text] hover:bg-[--odl-card] hover:shadow-md",
    accent: "bg-[--odl-accent] text-[--odl-background] hover:opacity-90 hover:shadow-glow",
    ghost: "bg-transparent hover:bg-[--odl-card] text-[--odl-text]",
    danger: "bg-[--odl-danger] text-white hover:opacity-90",
    quantum: "bg-gradient-to-r from-[--odl-accent] to-purple-500 text-[--odl-background] hover:shadow-quantum",
  },
  sizes: {
    md: "px-[var(--space-4)] py-[var(--space-3)] text-base",
    sm: "px-[var(--space-3)] py-[var(--space-2)] text-sm",
    lg: "px-[var(--space-6)] py-[var(--space-4)] text-lg",
    icon: "h-10 w-10",
  },
} satisfies ComponentConfig;

// Card Component Overrides
export const card = {
  base: "bg-[--odl-card] text-[--odl-text] rounded-[var(--radius)] shadow-sm border border-[--odl-border] transition-all duration-[var(--motion-micro)]",
  variants: {
    default: "",
    elevated: "shadow-md hover:shadow-lg",
    interactive: "hover:border-[--odl-accent] cursor-pointer",
    quantum: "hover:shadow-quantum bg-gradient-to-br from-[--odl-card] to-[--odl-background]",
  },
  sizes: {
    default: "p-6",
    compact: "p-4",
    spacious: "p-8",
  },
} satisfies ComponentConfig;

// Input Component Overrides
export const input = {
  base: "bg-[--odl-button] border border-[--odl-border] text-[--odl-text] placeholder-[--odl-sub-text] rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-[--odl-accent] focus:border-transparent transition-all duration-[var(--motion-micro)]",
  variants: {
    default: "",
    error: "border-[--odl-danger] focus:ring-[--odl-danger]",
    success: "border-green-500 focus:ring-green-500",
  },
  sizes: {
    default: "px-4 py-3",
    sm: "px-3 py-2 text-sm",
    lg: "px-5 py-4 text-lg",
  },
} satisfies ComponentConfig;

// Dialog/Modal Component Overrides
export const dialog = {
  overlay: "fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300",
  content: "fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] bg-[--odl-card] text-[--odl-text] rounded-[var(--radius-lg)] shadow-lg border border-[--odl-border] p-6 duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
  header: "text-lg font-semibold",
  footer: "flex flex-row justify-end gap-2 mt-6",
};

// Table Component Overrides
export const table = {
  wrapper: "w-full overflow-auto",
  table: "w-full caption-bottom text-sm",
  header: "border-b border-[--odl-border]",
  headerCell: "h-12 px-4 text-left align-middle font-medium text-[--odl-sub-text]",
  body: "[&_tr:last-child]:border-0",
  row: "border-b border-[--odl-border] transition-colors hover:bg-[--odl-button]/50",
  cell: "p-4 align-middle",
};

// Tooltip Component Overrides  
export const tooltip = {
  trigger: "cursor-help",
  content: "z-50 overflow-hidden rounded-md bg-[--odl-button] px-3 py-1.5 text-sm text-[--odl-text] shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
};

// Alert Component Overrides
export const alert = {
  base: "relative w-full rounded-[var(--radius)] border p-4",
  variants: {
    default: "bg-[--odl-card] border-[--odl-border] text-[--odl-text]",
    warning: "bg-yellow-900/20 border-yellow-900/50 text-yellow-200",
    error: "bg-red-900/20 border-red-900/50 text-red-200",
    success: "bg-green-900/20 border-green-900/50 text-green-200",
  },
};

// Badge Component Overrides
export const badge = {
  base: "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  variants: {
    default: "bg-[--odl-button] text-[--odl-text]",
    accent: "bg-[--odl-accent] text-[--odl-background]",
    outline: "border border-[--odl-border] text-[--odl-text]",
    quantum: "bg-gradient-to-r from-purple-500 to-[--odl-accent] text-white",
  },
};

// Progress Component Overrides
export const progress = {
  root: "relative h-4 w-full overflow-hidden rounded-full bg-[--odl-button]",
  indicator: "h-full w-full flex-1 bg-[--odl-accent] transition-all duration-500 ease-out",
  quantum: "h-full w-full flex-1 bg-gradient-to-r from-[--odl-accent] to-purple-500 transition-all duration-500 ease-out animate-shimmer",
};

// Switch Component Overrides
export const switchComponent = {
  root: "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--odl-accent] focus-visible:ring-offset-2 focus-visible:ring-offset-[--odl-background] disabled:cursor-not-allowed disabled:opacity-50",
  checked: "bg-[--odl-accent]",
  unchecked: "bg-[--odl-button]",
  thumb: "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
};

// Export all theme components
export const opulentiaTheme = {
  button,
  card,
  input,
  dialog,
  table,
  tooltip,
  alert,
  badge,
  progress,
  switch: switchComponent,
} as const;

// Helper function to apply theme classes
export function cn(...classes: (string | undefined | null | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}

// Quote Hero Component Implementation
export function QuoteHero({ children }: { children: string }) {
  return (
    <h1
      data-quote
      className="text-[clamp(3rem,8vw,5rem)] font-bold text-center before:content-['"'] after:content-['"'] before:text-[--odl-accent] after:text-[--odl-accent] before:mr-2 after:ml-2"
    >
      {children}
    </h1>
  );
}