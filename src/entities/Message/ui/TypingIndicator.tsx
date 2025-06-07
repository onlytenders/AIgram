import type { FC } from 'react';
import { useTheme } from '../../../shared/hooks/useTheme';

export const TypingIndicator: FC = () => {
    const { getThemeClass } = useTheme();
    
    return (
        <div className="flex items-center gap-1 p-4 max-w-[80%] animate-fade">
            <div className={`rounded-2xl p-3 flex items-center gap-1 ${
                getThemeClass('bg-gray-200', 'bg-gray-700')
            }`}>
                <div className={`w-2 h-2 rounded-full animate-bounce ${
                    getThemeClass('bg-gray-400', 'bg-gray-400')
                }`} style={{ animationDelay: '0ms' }} />
                <div className={`w-2 h-2 rounded-full animate-bounce ${
                    getThemeClass('bg-gray-400', 'bg-gray-400')
                }`} style={{ animationDelay: '150ms' }} />
                <div className={`w-2 h-2 rounded-full animate-bounce ${
                    getThemeClass('bg-gray-400', 'bg-gray-400')
                }`} style={{ animationDelay: '300ms' }} />
            </div>
        </div>
    );
}; 