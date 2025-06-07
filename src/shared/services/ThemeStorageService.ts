import type { IThemeStorage } from '../types/theme.interfaces';
import { ThemeMode } from '../types/theme.interfaces';

// Abstract storage provider
abstract class StorageProvider {
  public abstract getItem(key: string): string | null;
  public abstract setItem(key: string, value: string): void;
  public abstract removeItem(key: string): void;
}

// Local storage implementation
class LocalStorageProvider extends StorageProvider {
  public getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return null;
    }
  }

  public setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('Failed to write to localStorage:', error);
    }
  }

  public removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }
}

// Session storage implementation (fallback)
class SessionStorageProvider extends StorageProvider {
  public getItem(key: string): string | null {
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.warn('Failed to read from sessionStorage:', error);
      return null;
    }
  }

  public setItem(key: string, value: string): void {
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.warn('Failed to write to sessionStorage:', error);
    }
  }

  public removeItem(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove from sessionStorage:', error);
    }
  }
}

// In-memory fallback storage
class MemoryStorageProvider extends StorageProvider {
  private storage = new Map<string, string>();

  public getItem(key: string): string | null {
    return this.storage.get(key) || null;
  }

  public setItem(key: string, value: string): void {
    this.storage.set(key, value);
  }

  public removeItem(key: string): void {
    this.storage.delete(key);
  }
}

export class ThemeStorageService implements IThemeStorage {
  private static readonly THEME_KEY = 'aigram_theme_mode';
  private storageProvider: StorageProvider;

  constructor() {
    // Try to use localStorage, fallback to sessionStorage, then memory
    this.storageProvider = this.getBestStorageProvider();
  }

  public saveTheme(mode: ThemeMode): void {
    try {
      this.storageProvider.setItem(ThemeStorageService.THEME_KEY, mode);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }

  public loadTheme(): ThemeMode | null {
    try {
      const savedMode = this.storageProvider.getItem(ThemeStorageService.THEME_KEY);
      
      if (savedMode && this.isValidThemeMode(savedMode)) {
        return savedMode as ThemeMode;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to load theme:', error);
      return null;
    }
  }

  public clearTheme(): void {
    try {
      this.storageProvider.removeItem(ThemeStorageService.THEME_KEY);
    } catch (error) {
      console.error('Failed to clear theme:', error);
    }
  }

  // Private helper methods
  private getBestStorageProvider(): StorageProvider {
    // Try localStorage first
    if (this.isStorageAvailable('localStorage')) {
      return new LocalStorageProvider();
    }
    
    // Fallback to sessionStorage
    if (this.isStorageAvailable('sessionStorage')) {
      return new SessionStorageProvider();
    }
    
    // Final fallback to memory storage
    return new MemoryStorageProvider();
  }

  private isStorageAvailable(type: 'localStorage' | 'sessionStorage'): boolean {
    try {
      const storage = window[type];
      const test = '__storage_test__';
      storage.setItem(test, test);
      storage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private isValidThemeMode(mode: string): boolean {
    return Object.values(ThemeMode).includes(mode as ThemeMode);
  }
}

// Singleton instance
export const themeStorageService = new ThemeStorageService(); 