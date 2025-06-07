import type { ITheme, IThemeColors } from '../types/theme.interfaces';
import { ThemeMode } from '../types/theme.interfaces';

// Abstract theme factory
abstract class ThemeFactory {
  protected abstract createColors(): IThemeColors;
  
  public createTheme(mode: ThemeMode, name: string): ITheme {
    return {
      mode,
      colors: this.createColors(),
      name
    };
  }
}

// Light theme implementation
class LightThemeFactory extends ThemeFactory {
  protected createColors(): IThemeColors {
    return {
      background: {
        primary: '#ffffff',
        secondary: '#f8fafc',
        tertiary: '#f1f5f9',
        chat: '#ffffff',
        message: {
          incoming: '#f1f5f9',
          outgoing: '#3b82f6'
        }
      },
      text: {
        primary: '#1e293b',
        secondary: '#64748b',
        tertiary: '#94a3b8',
        inverse: '#ffffff'
      },
      border: {
        primary: '#e2e8f0',
        secondary: '#cbd5e1',
        focus: '#3b82f6'
      },
      status: {
        online: '#10b981',
        success: '#059669',
        error: '#dc2626',
        warning: '#d97706',
        info: '#0ea5e9'
      },
      interactive: {
        primary: '#3b82f6',
        primaryHover: '#2563eb',
        secondary: '#64748b',
        secondaryHover: '#475569'
      }
    };
  }
}

// Dark theme implementation
class DarkThemeFactory extends ThemeFactory {
  protected createColors(): IThemeColors {
    return {
      background: {
        primary: '#0f172a',
        secondary: '#1e293b',
        tertiary: '#334155',
        chat: '#1e293b',
        message: {
          incoming: '#334155',
          outgoing: '#3b82f6'
        }
      },
      text: {
        primary: '#f8fafc',
        secondary: '#cbd5e1',
        tertiary: '#94a3b8',
        inverse: '#0f172a'
      },
      border: {
        primary: '#334155',
        secondary: '#475569',
        focus: '#3b82f6'
      },
      status: {
        online: '#10b981',
        success: '#059669',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#06b6d4'
      },
      interactive: {
        primary: '#3b82f6',
        primaryHover: '#2563eb',
        secondary: '#64748b',
        secondaryHover: '#475569'
      }
    };
  }
}

// Theme registry using factory pattern
export class ThemeRegistry {
  private static lightFactory = new LightThemeFactory();
  private static darkFactory = new DarkThemeFactory();
  
  public static createTheme(mode: ThemeMode): ITheme {
    switch (mode) {
      case ThemeMode.LIGHT:
        return this.lightFactory.createTheme(mode, 'Light');
      case ThemeMode.DARK:
        return this.darkFactory.createTheme(mode, 'Dark');
      case ThemeMode.SYSTEM:
        // Return theme based on system preference
        return this.getSystemTheme();
      default:
        throw new Error(`Unknown theme mode: ${mode}`);
    }
  }
  
  private static getSystemTheme(): ITheme {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const actualMode = prefersDark ? ThemeMode.DARK : ThemeMode.LIGHT;
    
    if (prefersDark) {
      return this.darkFactory.createTheme(actualMode, 'System (Dark)');
    } else {
      return this.lightFactory.createTheme(actualMode, 'System (Light)');
    }
  }
  
  public static getAllThemes(): ITheme[] {
    return [
      this.createTheme(ThemeMode.LIGHT),
      this.createTheme(ThemeMode.DARK),
      this.createTheme(ThemeMode.SYSTEM)
    ];
  }
  
  public static isValidThemeMode(mode: string): mode is ThemeMode {
    return Object.values(ThemeMode).includes(mode as ThemeMode);
  }
}

// Default themes for easy access
export const defaultThemes = {
  light: ThemeRegistry.createTheme(ThemeMode.LIGHT),
  dark: ThemeRegistry.createTheme(ThemeMode.DARK),
  system: ThemeRegistry.createTheme(ThemeMode.SYSTEM)
}; 