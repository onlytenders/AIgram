import { useState } from 'react';
import type { FC } from 'react';
import { chatService } from '../../../shared/services/ChatService';
import { ThemeToggle } from '../../ThemeToggle/ui/ThemeToggle';
import { themeSelectors } from '../../../shared/stores/useThemeStore';

interface SettingsDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsDialog: FC<SettingsDialogProps> = ({ isOpen, onClose }) => {
    const [apiKey, setApiKey] = useState('');
    const isDark = themeSelectors.isDark();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (apiKey.trim()) {
            chatService.setApiKey(apiKey.trim());
            setApiKey(''); // Clear the input
            onClose();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Allow Cmd+V, Ctrl+V
        if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
            return;
        }
    };

    if (!isOpen) return null;

    // Dynamic theme-aware styles
    const overlayClass = "fixed inset-0 bg-gray-500/50 z-40 animate-fade";
    const dialogClass = `rounded-lg p-6 w-full max-w-md animate-scale shadow-lg ${
        isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
    }`;
    const labelClass = `block text-sm font-medium mb-2 ${
        isDark ? 'text-gray-200' : 'text-gray-700'
    }`;
    const inputClass = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        isDark 
            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
    }`;
    const helpTextClass = `mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`;
    const sectionClass = `p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`;

    return (
        <>
            <div 
                className={overlayClass}
                onClick={onClose}
            />
            <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
                <div 
                    className={dialogClass}
                    onClick={e => e.stopPropagation()}
                >
                    <h2 className="text-xl font-semibold mb-6">Settings</h2>
                    
                    {/* Theme Section */}
                    <div className="mb-6">
                        <h3 className="text-lg font-medium mb-3">Appearance</h3>
                        <div className={sectionClass}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Theme</p>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Choose your preferred theme
                                    </p>
                                </div>
                                <ThemeToggle 
                                    variant="button" 
                                    showLabel={true}
                                    size="md"
                                />
                            </div>
                        </div>
                    </div>

                    {/* API Key Section */}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <h3 className="text-lg font-medium mb-3">AI Configuration</h3>
                            <div className={sectionClass}>
                                <label htmlFor="apiKey" className={labelClass}>
                                    OpenAI API Key
                                </label>
                                <input
                                    type="password"
                                    id="apiKey"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className={inputClass}
                                    placeholder="sk-..."
                                    required
                                    autoComplete="off"
                                />
                                <p className={helpTextClass}>
                                    Your API key will be stored locally and used only for chat interactions.
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className={`px-4 py-2 rounded-md transition-colors ${
                                    isDark 
                                        ? 'text-gray-300 hover:bg-gray-700' 
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                            >
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}; 