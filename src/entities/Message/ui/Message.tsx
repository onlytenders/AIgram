import type { FC } from 'react';
import { themeClasses } from '../../../shared/styles';

interface MessageProps {
    text: string;
    isOutgoing: boolean;
    timestamp: string;
}

export const Message: FC<MessageProps> = ({ text, isOutgoing, timestamp }) => {
    return (
        <div className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'} mb-4 py-2`}>
            <div className={`max-w-[70%] px-4 py-2 ${isOutgoing ? themeClasses.messageOut : themeClasses.messageIn}`}>
                <p className="break-words">{text}</p>
                <span className={`text-xs ${isOutgoing ? 'text-blue-100' : 'text-gray-500'} block mt-1`}>
                    {timestamp}
                </span>
            </div>
        </div>
    );
}; 