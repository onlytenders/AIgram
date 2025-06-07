import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import type { IThemeStore, ITheme, IThemeColors } from '../types/theme.interfaces';
import { ThemeMode } from '../types/theme.interfaces';
import { ThemeRegistry } from '../config/themes';
import { themeStorageService } from '../services/ThemeStorageService';

interface ThemeStoreState extends IThemeStore {
  // Internal state
  _systemPrefersDark: boolean;
  _isInitialized: boolean;
  
  // Internal actions
  _initializeTheme: () => void;
  _updateSystemPreference: (prefersDark: boolean) => void;
  _applyThemeToDOM: (theme: ITheme) => void;
}

export const useThemeStore = create<ThemeStoreState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // State
      currentTheme: ThemeRegistry.createTheme(ThemeMode.LIGHT),
      mode: ThemeMode.LIGHT,
      isSystemTheme: false,
      _systemPrefersDark: false,
      _isInitialized: false,

      // Public actions
      setTheme: (mode: ThemeMode) => {
        const newTheme = ThemeRegistry.createTheme(mode);
        const isSystemTheme = mode === ThemeMode.SYSTEM;
        
        set({
          currentTheme: newTheme,
          mode,
          isSystemTheme
        });

        // Persist the theme
        themeStorageService.saveTheme(mode);
        
        // Apply to DOM
        get()._applyThemeToDOM(newTheme);
      },

      toggleTheme: () => {
        const currentMode = get().mode;
        let nextMode: ThemeMode;

        switch (currentMode) {
          case ThemeMode.LIGHT:
            nextMode = ThemeMode.DARK;
            break;
          case ThemeMode.DARK:
            nextMode = ThemeMode.SYSTEM;
            break;
          case ThemeMode.SYSTEM:
            nextMode = ThemeMode.LIGHT;
            break;
          default:
            nextMode = ThemeMode.LIGHT;
        }

        get().setTheme(nextMode);
      },

      getThemeColors: (): IThemeColors => {
        return get().currentTheme.colors;
      },

      isDarkMode: (): boolean => {
        const { currentTheme } = get();
        return currentTheme.mode === ThemeMode.DARK || 
               (currentTheme.mode === ThemeMode.SYSTEM && get()._systemPrefersDark);
      },

      isLightMode: (): boolean => {
        return !get().isDarkMode();
      },

      // Internal actions
      _initializeTheme: () => {
        if (get()._isInitialized) return;

        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Load saved theme or default to system
        const savedMode = themeStorageService.loadTheme() || ThemeMode.SYSTEM;
        const theme = ThemeRegistry.createTheme(savedMode);

        set({
          currentTheme: theme,
          mode: savedMode,
          isSystemTheme: savedMode === ThemeMode.SYSTEM,
          _systemPrefersDark: prefersDark,
          _isInitialized: true
        });

        // Apply initial theme to DOM
        get()._applyThemeToDOM(theme);

        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleSystemThemeChange = (e: MediaQueryListEvent) => {
          get()._updateSystemPreference(e.matches);
        };

        // Modern browsers
        if (mediaQuery.addEventListener) {
          mediaQuery.addEventListener('change', handleSystemThemeChange);
        } else {
          // Fallback for older browsers
          mediaQuery.addListener(handleSystemThemeChange);
        }
      },

      _updateSystemPreference: (prefersDark: boolean) => {
        const currentState = get();
        
        set({ _systemPrefersDark: prefersDark });

        // If currently using system theme, update the actual theme
        if (currentState.isSystemTheme) {
          const updatedTheme = ThemeRegistry.createTheme(ThemeMode.SYSTEM);
          set({ currentTheme: updatedTheme });
          get()._applyThemeToDOM(updatedTheme);
        }
      },

      _applyThemeToDOM: (theme: ITheme) => {
        const root = document.documentElement;
        const colors = theme.colors;

        // Apply CSS custom properties
        root.style.setProperty('--color-bg-primary', colors.background.primary);
        root.style.setProperty('--color-bg-secondary', colors.background.secondary);
        root.style.setProperty('--color-bg-tertiary', colors.background.tertiary);
        root.style.setProperty('--color-bg-chat', colors.background.chat);
        root.style.setProperty('--color-bg-message-incoming', colors.background.message.incoming);
        root.style.setProperty('--color-bg-message-outgoing', colors.background.message.outgoing);

        root.style.setProperty('--color-text-primary', colors.text.primary);
        root.style.setProperty('--color-text-secondary', colors.text.secondary);
        root.style.setProperty('--color-text-tertiary', colors.text.tertiary);
        root.style.setProperty('--color-text-inverse', colors.text.inverse);

        root.style.setProperty('--color-border-primary', colors.border.primary);
        root.style.setProperty('--color-border-secondary', colors.border.secondary);
        root.style.setProperty('--color-border-focus', colors.border.focus);

        root.style.setProperty('--color-status-online', colors.status.online);
        root.style.setProperty('--color-status-success', colors.status.success);
        root.style.setProperty('--color-status-error', colors.status.error);
        root.style.setProperty('--color-status-warning', colors.status.warning);
        root.style.setProperty('--color-status-info', colors.status.info);

        root.style.setProperty('--color-interactive-primary', colors.interactive.primary);
        root.style.setProperty('--color-interactive-primary-hover', colors.interactive.primaryHover);
        root.style.setProperty('--color-interactive-secondary', colors.interactive.secondary);
        root.style.setProperty('--color-interactive-secondary-hover', colors.interactive.secondaryHover);

        // Add theme class to body for additional styling
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        const actualMode = get().isDarkMode() ? 'dark' : 'light';
        document.body.classList.add(`theme-${actualMode}`);
      }
    })),
    {
      name: 'theme-store',
      partialize: (state: ThemeStoreState) => ({
        mode: state.mode,
        isSystemTheme: state.isSystemTheme
      })
    }
  )
);

// Initialize theme on app start
export const initializeTheme = () => {
  useThemeStore.getState()._initializeTheme();
};

// Selectors for better performance
export const themeSelectors = {
  colors: () => useThemeStore(state => state.getThemeColors()),
  isDark: () => useThemeStore(state => state.isDarkMode()),
  isLight: () => useThemeStore(state => state.isLightMode()),
  mode: () => useThemeStore(state => state.mode),
  theme: () => useThemeStore(state => state.currentTheme)
}; 