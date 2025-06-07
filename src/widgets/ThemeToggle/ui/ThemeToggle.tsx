import type { FC } from 'react';
import { useThemeStore, themeSelectors } from '../../../shared/stores/useThemeStore';
import { ThemeMode } from '../../../shared/types/theme.interfaces';

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'button' | 'icon' | 'minimal';
  showLabel?: boolean;
  className?: string;
}

const ThemeIcon: FC<{ mode: ThemeMode; size: string }> = ({ mode, size }) => {
  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-7 h-7' : 'w-6 h-6';

  switch (mode) {
    case ThemeMode.LIGHT:
      return (
        <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    case ThemeMode.DARK:
      return (
        <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      );
    case ThemeMode.SYSTEM:
      return (
        <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    default:
      return null;
  }
};

export const ThemeToggle: FC<ThemeToggleProps> = ({ 
  size = 'md', 
  variant = 'button',
  showLabel = false,
  className = ''
}) => {
  const mode = themeSelectors.mode();
  const isDark = themeSelectors.isDark();
  const toggleTheme = useThemeStore(state => state.toggleTheme);

  const getThemeLabel = (mode: ThemeMode): string => {
    switch (mode) {
      case ThemeMode.LIGHT: return 'Light';
      case ThemeMode.DARK: return 'Dark';
      case ThemeMode.SYSTEM: return 'System';
      default: return 'Theme';
    }
  };

  const getNextThemeLabel = (currentMode: ThemeMode): string => {
    switch (currentMode) {
      case ThemeMode.LIGHT: return 'Switch to Dark';
      case ThemeMode.DARK: return 'Switch to System';
      case ThemeMode.SYSTEM: return 'Switch to Light';
      default: return 'Toggle Theme';
    }
  };

  const baseClasses = 'transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
  
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };

  const variantClasses = {
    button: `${sizeClasses[size]} rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 shadow-sm`,
    icon: `${sizeClasses[size]} rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-800`,
    minimal: `${sizeClasses[size]} rounded hover:bg-gray-100 text-gray-600 hover:text-gray-800`
  };

  // Apply theme-aware styles
  const themeAwareClasses = isDark 
    ? variantClasses[variant].replace(/bg-white|bg-gray-50|bg-gray-100/g, match => {
        switch (match) {
          case 'bg-white': return 'bg-gray-800';
          case 'bg-gray-50': return 'bg-gray-700';
          case 'bg-gray-100': return 'bg-gray-700';
          case 'bg-gray-800': return 'bg-gray-700';
          default: return match;
        }
      }).replace(/text-gray-700|text-gray-600|text-gray-900|text-gray-800/g, match => {
        switch (match) {
          case 'text-gray-700': return 'text-gray-200';
          case 'text-gray-600': return 'text-gray-300';
          case 'text-gray-900': return 'text-white';
          case 'text-gray-800': return 'text-gray-100';
          default: return match;
        }
      }).replace(/border-gray-200/g, 'border-gray-600')
    : variantClasses[variant];

  const buttonClasses = `${baseClasses} ${themeAwareClasses} ${className}`;

  return (
    <button
      onClick={toggleTheme}
      className={buttonClasses}
      title={getNextThemeLabel(mode)}
      aria-label={getNextThemeLabel(mode)}
    >
      <div className="flex items-center gap-2">
        <ThemeIcon mode={mode} size={size} />
        {showLabel && (
          <span className={`font-medium ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'}`}>
            {getThemeLabel(mode)}
          </span>
        )}
      </div>
    </button>
  );
}; 