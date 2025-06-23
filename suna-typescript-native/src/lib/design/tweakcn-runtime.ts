/**
 * tweakcn Runtime Theme System
 * Enables dynamic theme parameterization via JSON contract
 */

export interface TweakcnParams {
  palette?: {
    accent?: string;
    background?: string;
    card?: string;
    button?: string;
    text?: string;
    subText?: string;
    border?: string;
    danger?: string;
    mintBg?: string;
    [key: string]: string | undefined;
  };
  labels?: {
    presentation?: string;
    mainTitle?: string;
    [key: string]: string | undefined;
  };
  layout?: {
    padding?: string;
    quoteAccent?: boolean;
    gridColumns?: number;
    [key: string]: string | number | boolean | undefined;
  };
  motion?: {
    microDuration?: string;
    macroCurve?: string;
    springCurve?: string;
  };
  features?: {
    quantumMode?: boolean;
    kinestheticLayers?: boolean;
    cognitiveEvolution?: boolean;
  };
}

// Global tweakcn parameters
declare global {
  interface Window {
    tweakcnParams?: TweakcnParams;
    tweakcnRuntime?: TweakcnRuntime;
  }
}

export class TweakcnRuntime {
  private params: TweakcnParams = {};
  private observers: Set<(params: TweakcnParams) => void> = new Set();
  private styleElement: HTMLStyleElement | null = null;

  constructor(initialParams?: TweakcnParams) {
    if (initialParams) {
      this.params = initialParams;
    }
    
    // Check for global params
    if (typeof window !== 'undefined' && window.tweakcnParams) {
      this.params = { ...this.params, ...window.tweakcnParams };
    }
    
    this.init();
  }

  private init(): void {
    if (typeof document === 'undefined') return;
    
    // Create style element for runtime CSS
    this.styleElement = document.createElement('style');
    this.styleElement.id = 'tweakcn-runtime-styles';
    document.head.appendChild(this.styleElement);
    
    // Apply initial params
    this.applyParams(this.params);
    
    // Make runtime available globally
    if (typeof window !== 'undefined') {
      window.tweakcnRuntime = this;
    }
  }

  /**
   * Apply theme parameters
   */
  public applyParams(params: TweakcnParams): void {
    this.params = { ...this.params, ...params };
    
    // Apply palette changes
    if (params.palette) {
      this.applyPalette(params.palette);
    }
    
    // Apply layout changes
    if (params.layout) {
      this.applyLayout(params.layout);
    }
    
    // Apply motion changes
    if (params.motion) {
      this.applyMotion(params.motion);
    }
    
    // Notify observers
    this.observers.forEach(observer => observer(this.params));
    
    // Emit custom event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tweakcn:updated', { 
        detail: this.params 
      }));
    }
  }

  /**
   * Apply palette changes to CSS variables
   */
  private applyPalette(palette: TweakcnParams['palette']): void {
    if (!palette) return;
    
    const root = document.documentElement;
    
    Object.entries(palette).forEach(([key, value]) => {
      if (value) {
        // Convert camelCase to kebab-case
        const cssVarName = `--odl-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        root.style.setProperty(cssVarName, value);
        
        // Also update shadcn variables if applicable
        switch (key) {
          case 'background':
            root.style.setProperty('--background', value);
            break;
          case 'text':
            root.style.setProperty('--foreground', value);
            break;
          case 'accent':
            root.style.setProperty('--accent', value);
            root.style.setProperty('--chart-1', value);
            break;
          case 'card':
            root.style.setProperty('--card', value);
            break;
          case 'button':
            root.style.setProperty('--primary', value);
            break;
          case 'border':
            root.style.setProperty('--border', value);
            break;
        }
      }
    });
  }

  /**
   * Apply layout changes
   */
  private applyLayout(layout: TweakcnParams['layout']): void {
    if (!layout) return;
    
    const root = document.documentElement;
    
    if (layout.padding) {
      root.style.setProperty('--layout-padding', layout.padding);
    }
    
    if (layout.gridColumns) {
      root.style.setProperty('--grid-columns', layout.gridColumns.toString());
    }
    
    // Handle quote accent feature
    if (layout.quoteAccent !== undefined) {
      document.body.classList.toggle('quote-accent-enabled', layout.quoteAccent);
    }
  }

  /**
   * Apply motion changes
   */
  private applyMotion(motion: TweakcnParams['motion']): void {
    if (!motion) return;
    
    const root = document.documentElement;
    
    if (motion.microDuration) {
      root.style.setProperty('--motion-micro', motion.microDuration);
    }
    
    if (motion.macroCurve) {
      root.style.setProperty('--motion-macro', motion.macroCurve);
    }
    
    if (motion.springCurve) {
      root.style.setProperty('--motion-spring', motion.springCurve);
    }
  }

  /**
   * Get current parameters
   */
  public getParams(): TweakcnParams {
    return { ...this.params };
  }

  /**
   * Subscribe to parameter changes
   */
  public subscribe(observer: (params: TweakcnParams) => void): () => void {
    this.observers.add(observer);
    
    // Return unsubscribe function
    return () => {
      this.observers.delete(observer);
    };
  }

  /**
   * Reset to default parameters
   */
  public reset(): void {
    // Reset CSS variables to defaults
    const defaultParams: TweakcnParams = {
      palette: {
        background: '#0F0F0F',
        card: '#141414',
        button: '#1B1B1B',
        text: '#EFEFEF',
        subText: '#C0C0C0',
        border: '#080808',
        accent: '#FFAA6E',
        danger: '#FF4444',
        mintBg: '#E5EFE5',
      },
      layout: {
        padding: '3rem',
        quoteAccent: true,
      },
      motion: {
        microDuration: '120ms ease-out',
        macroCurve: 'cubic-bezier(0.33, 1, 0.68, 1)',
        springCurve: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    };
    
    this.applyParams(defaultParams);
  }

  /**
   * Export current theme as JSON
   */
  public exportTheme(): string {
    return JSON.stringify(this.params, null, 2);
  }

  /**
   * Import theme from JSON
   */
  public importTheme(json: string): void {
    try {
      const params = JSON.parse(json) as TweakcnParams;
      this.applyParams(params);
    } catch (error) {
      console.error('Failed to import theme:', error);
    }
  }

  /**
   * Generate CSS from current parameters
   */
  public generateCSS(): string {
    const { palette, layout, motion } = this.params;
    let css = ':root {\n';
    
    // Palette variables
    if (palette) {
      Object.entries(palette).forEach(([key, value]) => {
        if (value) {
          const cssVarName = `--odl-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
          css += `  ${cssVarName}: ${value};\n`;
        }
      });
    }
    
    // Layout variables
    if (layout?.padding) {
      css += `  --layout-padding: ${layout.padding};\n`;
    }
    
    // Motion variables
    if (motion) {
      if (motion.microDuration) css += `  --motion-micro: ${motion.microDuration};\n`;
      if (motion.macroCurve) css += `  --motion-macro: ${motion.macroCurve};\n`;
      if (motion.springCurve) css += `  --motion-spring: ${motion.springCurve};\n`;
    }
    
    css += '}\n';
    
    return css;
  }
}

// React Hook for tweakcn
export function useTweakcn() {
  const [params, setParams] = React.useState<TweakcnParams>(() => {
    if (typeof window !== 'undefined' && window.tweakcnRuntime) {
      return window.tweakcnRuntime.getParams();
    }
    return {};
  });

  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.tweakcnRuntime) return;
    
    const unsubscribe = window.tweakcnRuntime.subscribe((newParams) => {
      setParams(newParams);
    });
    
    return unsubscribe;
  }, []);

  const updateParams = React.useCallback((newParams: TweakcnParams) => {
    if (typeof window !== 'undefined' && window.tweakcnRuntime) {
      window.tweakcnRuntime.applyParams(newParams);
    }
  }, []);

  return { params, updateParams };
}

// Initialize runtime on load
if (typeof window !== 'undefined' && !window.tweakcnRuntime) {
  new TweakcnRuntime();
}

import React from 'react';