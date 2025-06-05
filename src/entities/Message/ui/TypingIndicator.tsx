import type { FC } from 'react';

export const TypingIndicator: FC = () => {
    return (
        <div className="flex items-center gap-1 p-4 max-w-[80%] animate-fade">
            <div className="bg-gray-200 rounded-2xl p-3 flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
        </div>
    );
}; 