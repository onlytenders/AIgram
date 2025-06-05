import { useState } from 'react';
import type { FC } from 'react';
import { messagesStore } from '../../../entities/Message/model/messages.store';

interface SettingsDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsDialog: FC<SettingsDialogProps> = ({ isOpen, onClose }) => {
    const [apiKey, setApiKey] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (apiKey.trim()) {
            messagesStore.setApiKey(apiKey.trim());
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

    return (
        <>
            <div 
                className="fixed inset-0 bg-gray-500/50 z-40 animate-fade"
                onClick={onClose}
            />
            <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
                <div 
                    className="bg-white rounded-lg p-6 w-full max-w-md animate-scale shadow-lg"
                    onClick={e => e.stopPropagation()}
                >
                    <h2 className="text-xl font-semibold mb-4">Settings</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                                OpenAI API Key
                            </label>
                            <input
                                type="password"
                                id="apiKey"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="sk-..."
                                required
                                autoComplete="off"
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                Your API key will be stored locally and used only for chat interactions.
                            </p>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
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