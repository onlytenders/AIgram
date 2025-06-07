import { useThemeStore, themeSelectors } from '../stores/useThemeStore';
import type { ThemeMode, IThemeColors } from '../types/interfaces';

/**
 * Custom hook for theme management
 * Provides a clean API for components to interact with the theme system
 */
export const useTheme = () => {
  // Zustand selectors for optimal performance
  const currentTheme = useThemeStore(state => state.currentTheme);
  const mode = useThemeStore(state => state.mode);
  const isSystemTheme = useThemeStore(state => state.isSystemTheme);
  
  // Actions
  const setTheme = useThemeStore(state => state.setTheme);
  const toggleTheme = useThemeStore(state => state.toggleTheme);
  
  // Computed values using selectors for performance
  const colors = themeSelectors.colors();
  const isDark = themeSelectors.isDark();
  const isLight = themeSelectors.isLight();

  // Utility methods
  const getThemeName = (): string => {
    return currentTheme.name;
  };

  const getThemeClass = (lightClass: string, darkClass: string): string => {
    return isDark ? darkClass : lightClass;
  };

  const getThemeValue = <T>(lightValue: T, darkValue: T): T => {
    return isDark ? darkValue : lightValue;
  };

  // CSS variable helpers
  const getCSSVariable = (variableName: string): string => {
    return `var(--color-${variableName})`;
  };

  const applyThemeClasses = (...classes: string[]): string => {
    return classes.join(' ');
  };

  // Theme-aware style utilities
  const getBackgroundClass = (variant: 'primary' | 'secondary' | 'tertiary' | 'chat' = 'primary'): string => {
    return `bg-theme-${variant}`;
  };

  const getTextClass = (variant: 'primary' | 'secondary' | 'tertiary' | 'inverse' = 'primary'): string => {
    return `text-theme-${variant}`;
  };

  const getBorderClass = (variant: 'primary' | 'secondary' | 'focus' = 'primary'): string => {
    return `border-theme-${variant}`;
  };

  // Advanced theme utilities
  const createThemeAwareStyle = (styles: {
    light: Record<string, string>;
    dark: Record<string, string>;
  }): Record<string, string> => {
    return isDark ? styles.dark : styles.light;
  };

  const getMessageBackgroundClass = (isOutgoing: boolean): string => {
    return isOutgoing ? 'bg-theme-message-outgoing' : 'bg-theme-message-incoming';
  };

  const getMessageTextClass = (isOutgoing: boolean): string => {
    return isOutgoing ? 'text-theme-inverse' : 'text-theme-primary';
  };

  return {
    // State
    currentTheme,
    mode,
    isSystemTheme,
    colors,
    isDark,
    isLight,

    // Actions
    setTheme,
    toggleTheme,

    // Utility methods
    getThemeName,
    getThemeClass,
    getThemeValue,
    getCSSVariable,
    applyThemeClasses,

    // Theme-aware class utilities
    getBackgroundClass,
    getTextClass,
    getBorderClass,
    getMessageBackgroundClass,
    getMessageTextClass,

    // Advanced utilities
    createThemeAwareStyle,

    // Convenience getters for common use cases
    containerClass: getBackgroundClass('primary') + ' ' + getTextClass('primary'),
    surfaceClass: getBackgroundClass('secondary') + ' ' + getBorderClass('primary'),
    cardClass: getBackgroundClass('primary') + ' ' + getTextClass('primary') + ' ' + getBorderClass('primary'),
    
    // Theme mode checkers
    isLightTheme: () => mode === 'light' as ThemeMode,
    isDarkTheme: () => isDark,
    isSystemMode: () => mode === 'system' as ThemeMode,
  };
};

export default useTheme; 