import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { themeClasses } from '../../../shared/styles';
import { type Chat } from '../../../entities/Chat/model/chats.store';
import { useState } from 'react';
import { SettingsDialog } from '../../Settings/ui/SettingsDialog';
import { useChats, useCreateChat } from '../../../shared/hooks/useChats';
import { useTheme } from '../../../shared/hooks/useTheme';

interface ChatItemProps extends Chat {
    onClick: () => void;
}

const MAX_MESSAGE_LENGTH = 30;

const truncateMessage = (message: string) => {
    if (!message) return '';
    if (message.length <= MAX_MESSAGE_LENGTH) return message;
    return message.substring(0, MAX_MESSAGE_LENGTH) + '...';
};

const ChatItem: FC<ChatItemProps> = ({ name, lastMessage, timestamp, isOnline, onClick }) => {
    const { getThemeClass, isDark } = useTheme();
    
    return (
        <div 
            className={`flex items-center p-4 cursor-pointer chat-transition animate-fade border-b border-theme-primary ${
                getThemeClass('hover:bg-gray-50', 'hover:bg-gray-700')
            }`}
            onClick={onClick}
        >
            <div className="relative">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-medium ${
                    getThemeClass('bg-gray-200 text-gray-700', 'bg-gray-600 text-gray-200')
                }`}>
                    {name[0].toUpperCase()}
                </div>
                {isOnline && (
                    <div className={themeClasses.onlineIndicator} />
                )}
            </div>
            <div className="ml-4 flex-1 min-w-0 px-3">
                <div className="flex justify-between items-center">
                    <h3 className="font-medium text-theme-primary truncate">{truncateMessage(name)}</h3>
                    <span className="text-sm text-theme-secondary ml-2 flex-shrink-0">{timestamp}</span>
                </div>
                <p className="text-sm text-theme-secondary line-clamp-1">
                    {truncateMessage(lastMessage || '* Empty chat *')}
                </p>
            </div>
        </div>
    );
};

export const ChatList: FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreatingChat, setIsCreatingChat] = useState(false);
    const [newChatName, setNewChatName] = useState('');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const { getThemeClass, isDark } = useTheme();

    // Use TanStack Query hooks
    const { data: chats = [], isLoading: chatsLoading, error: chatsError } = useChats();
    const { mutate: createChat, isPending: isCreatingNewChat, error: createError } = useCreateChat();

    const handleCreateChat = () => {
        if (!isCreatingChat) {
            setIsCreatingChat(true);
            return;
        }

        if (newChatName.trim() && !isCreatingNewChat) {
            createChat(newChatName.trim(), {
                onSuccess: (newChat) => {
                    setIsCreatingChat(false);
                    setNewChatName('');
                    navigate(`/chat/${newChat.id}`);
                },
                onError: (error) => {
                    console.error('Failed to create chat:', error);
                }
            });
        }
    };

    const handleCancelNewChat = () => {
        setIsCreatingChat(false);
        setNewChatName('');
    };

    const filteredChats = chats.filter(chat => 
        chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (chat.lastMessage && chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Loading state
    if (chatsLoading) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-theme-primary">
                <div className="text-center text-theme-secondary p-8">
                    <p className="text-lg font-medium">Loading chats...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (chatsError) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-theme-primary">
                <div className="text-center text-red-500 p-8">
                    <p className="text-lg font-medium">Failed to load chats</p>
                    <p className="text-sm mt-2">Please refresh the page</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full flex flex-col bg-theme-primary">
            <div className={`p-4 ${filteredChats.length > 0 ? 'border-b border-theme-primary' : ''} flex items-center gap-2 h-18`}>
                {filteredChats.length > 0 && (
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search chats..."
                        className={`flex-1 px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            getThemeClass(
                                'bg-gray-100 text-gray-900 placeholder-gray-500',
                                'bg-gray-700 text-white placeholder-gray-400'
                            )
                        }`}
                    />
                )}
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className={`p-2 rounded-full transition-colors ${
                        getThemeClass(
                            'text-gray-600 hover:bg-gray-100',
                            'text-gray-300 hover:bg-gray-700'
                        )
                    }`}
                    title="Settings"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
            </div>
            <div className="flex-1 overflow-y-auto">
                {filteredChats.length === 0 && (
                    <div className="flex-1 flex items-center justify-center h-full">
                        <p className="text-theme-secondary font-medium text-lg">Click on the + button to create a new chat</p>
                    </div>
                )}
                {filteredChats.map((chat) => (
                    <ChatItem 
                        key={chat.id} 
                        {...chat} 
                        onClick={() => navigate(`/chat/${chat.id}`)}
                    />
                ))}
            </div>
            {/* New Chat Section - Now properly sticky */}
            <div className="sticky bottom-0 bg-theme-primary border-t border-theme-primary">
                {isCreatingChat && (
                    <div className="p-4 border-b border-theme-primary animate-slide-up">
                        <input
                            type="text"
                            value={newChatName}
                            onChange={(e) => setNewChatName(e.target.value)}
                            placeholder="Enter chat name..."
                            className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                getThemeClass(
                                    'bg-gray-100 text-gray-900 placeholder-gray-500',
                                    'bg-gray-700 text-white placeholder-gray-400'
                                )
                            }`}
                            autoFocus
                            disabled={isCreatingNewChat}
                        />
                        {createError && (
                            <p className="text-red-500 text-sm mt-2">Failed to create chat. Please try again.</p>
                        )}
                    </div>
                )}
                <div className="p-4 flex gap-2 h-20">
                    {isCreatingChat ? (
                        <>
                            <button
                                onClick={handleCreateChat}
                                disabled={isCreatingNewChat || !newChatName.trim()}
                                className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCreatingNewChat ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    'Create Chat'
                                )}
                            </button>
                            <button
                                onClick={handleCancelNewChat}
                                disabled={isCreatingNewChat}
                                className={`py-2 px-4 rounded-lg transition-colors disabled:opacity-50 ${
                                    getThemeClass(
                                        'bg-gray-100 hover:bg-gray-200 text-gray-700',
                                        'bg-gray-700 hover:bg-gray-600 text-gray-200'
                                    )
                                }`}
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleCreateChat}
                            className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            New Chat
                        </button>
                    )}
                </div>
            </div>

            <SettingsDialog 
                isOpen={isSettingsOpen} 
                onClose={() => setIsSettingsOpen(false)} 
            />
        </div>
    );
}; 