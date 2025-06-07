export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system'
}

export interface IThemeColors {
  // Background colors
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    chat: string;
    message: {
      incoming: string;
      outgoing: string;
    };
  };
  
  // Text colors
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  
  // Border colors
  border: {
    primary: string;
    secondary: string;
    focus: string;
  };
  
  // Status colors
  status: {
    online: string;
    success: string;
    error: string;
    warning: string;
    info: string;
  };
  
  // Interactive colors
  interactive: {
    primary: string;
    primaryHover: string;
    secondary: string;
    secondaryHover: string;
  };
}

export interface ITheme {
  mode: ThemeMode;
  colors: IThemeColors;
  name: string;
}

export interface IThemeStore {
  currentTheme: ITheme;
  mode: ThemeMode;
  isSystemTheme: boolean;
  
  // Actions
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  getThemeColors: () => IThemeColors;
  isDarkMode: () => boolean;
  isLightMode: () => boolean;
}

// Theme persistence interface
export interface IThemeStorage {
  saveTheme: (mode: ThemeMode) => void;
  loadTheme: () => ThemeMode | null;
  clearTheme: () => void;
} 