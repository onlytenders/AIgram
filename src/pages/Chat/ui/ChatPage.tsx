import type { FC } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Message as MessageComponent } from '../../../entities/Message/ui/Message';
import { TypingIndicator } from '../../../entities/Message/ui/TypingIndicator';
import { themeClasses } from '../../../shared/styles';
import { layoutStyles } from '../../../shared/styles/layout';
import { chatsStore } from '../../../entities/Chat/model/chats.store';
import { useState, useEffect, useRef } from 'react';
import { useMessages } from '../../../shared/hooks/useMessages';
import { useChat } from '../../../shared/hooks/useChat';

export const ChatPage: FC = () => {
    const { chatId } = useParams();
    const navigate = useNavigate();
    const isMobile = window.innerWidth < 768;
    const [inputText, setInputText] = useState('');
    const [chatName, setChatName] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Use TanStack Query hooks
    const { data: messages = [], isLoading: messagesLoading } = useMessages(chatId);
    const { sendMessage, isLoading: isSending, error: sendError } = useChat();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (chatId) {
            const chat = chatsStore.getChat(chatId);
            if (chat) {
                setChatName(chat.name);
            } else {
                navigate('/');
            }
        } else {
            setChatName('');
        }
    }, [chatId, navigate]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isSending]);

    const handleSendMessage = async () => {
        if (!chatId || !inputText.trim() || isSending) return;

        const text = inputText.trim();
        setInputText('');

        try {
            sendMessage({
                chatId,
                text,
                chatName
            });
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Empty state when no chat is selected
    if (!chatId) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <div className="text-center text-gray-500 p-8">
                    <p className="text-lg font-medium">Pick a chat or create a new one</p>
                </div>
            </div>
        );
    }

    // Loading state
    if (messagesLoading) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <div className="text-center text-gray-500 p-8">
                    <p className="text-lg font-medium">Loading chat...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full flex flex-col">
            {/* Mobile Header */}
            <div className={layoutStyles.mobileNavbar}>
                <button 
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2"
                >
                    <svg className="w-6 h-6" fill="none" stroke="gray" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 19l-7-7 7-7" />
                    </svg>
                    {isMobile && <span>Back</span>}
                </button>
                <h1 className="text-xl font-semibold">{chatName}</h1>
                <div className="w-6" />
            </div>

            {/* Chat Header - Only visible on desktop */}
            <div className={`${themeClasses.chatHeader} hidden md:flex`}>
                <div className="flex-1">
                    <h2 className="font-semibold">{chatName}</h2>
                    <p className="text-sm text-gray-500">online</p>
                </div>
            </div>

            {/* Messages Area */}
            <div className={layoutStyles.contentArea}>
                <div className="p-4">
                    {sendError && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            Failed to send message. Please try again.
                        </div>
                    )}
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <div 
                                key={message.id} 
                                className="animate-fade"
                            >
                                <MessageComponent 
                                    text={message.text} 
                                    isOutgoing={message.isOutgoing} 
                                    timestamp={message.timestamp}
                                />
                            </div>
                        ))}
                    </div>
                    {isSending && <TypingIndicator />}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className={themeClasses.inputArea}>
                <div className="flex items-center gap-2 p-2">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isSending}
                    />
                    <button 
                        onClick={handleSendMessage}
                        disabled={!inputText.trim() || isSending}
                        className="p-2 text-white bg-blue-500 rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSending ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}; 