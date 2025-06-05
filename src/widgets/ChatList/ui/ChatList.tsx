import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { themeClasses } from '../../../shared/styles';
import { chatsStore, type Chat } from '../../../entities/Chat/model/chats.store';
import { useState, useEffect } from 'react';
import { SettingsDialog } from '../../Settings/ui/SettingsDialog';

interface ChatItemProps extends Chat {
    onClick: () => void;
}

const MAX_MESSAGE_LENGTH = 30;

const truncateMessage = (message: string) => {
    if (!message) return '';
    if (message.length <= MAX_MESSAGE_LENGTH) return message;
    return message.substring(0, MAX_MESSAGE_LENGTH) + '...';
};

const ChatItem: FC<ChatItemProps> = ({ id, name, lastMessage, timestamp, isOnline, onClick }) => {
    return (
        <div 
            className="flex items-center p-4 hover:bg-gray-50 cursor-pointer chat-transition animate-fade border-b border-gray-200"
            onClick={onClick}
        >
            <div className="relative">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    {name[0].toUpperCase()}
                </div>
                {isOnline && (
                    <div className={`absolute bottom-0 right-0 ${themeClasses.onlineIndicator}`} />
                )}
            </div>
            <div className="ml-4 flex-1 min-w-0 px-3">
                <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-900 truncate">{truncateMessage(name)}</h3>
                    <span className="text-sm text-gray-500 ml-2 flex-shrink-0">{timestamp}</span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-1">
                    {truncateMessage(lastMessage || '* Empty chat *')}
                </p>
            </div>
        </div>
    );
};

export const ChatList: FC = () => {
    const navigate = useNavigate();
    const [chats, setChats] = useState<Chat[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreatingChat, setIsCreatingChat] = useState(false);
    const [newChatName, setNewChatName] = useState('');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        const updateChats = () => setChats(chatsStore.getChats());
        updateChats();

        window.addEventListener('chatUpdate', updateChats);
        return () => window.removeEventListener('chatUpdate', updateChats);
    }, []);

    const handleCreateChat = () => {
        if (!isCreatingChat) {
            setIsCreatingChat(true);
            return;
        }

        if (newChatName.trim()) {
            const newChat = chatsStore.createNewChat(newChatName.trim());
            setChats(chatsStore.getChats());
            setIsCreatingChat(false);
            setNewChatName('');
            navigate(`/chat/${newChat.id}`);
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

    return (
        <div className="h-full w-full flex flex-col">
            <div className={`p-4 ${filteredChats.length > 0 ? 'border-b border-gray-200' : ''} flex items-center gap-2 h-18`}>
                {filteredChats.length > 0 && (
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search chats..."
                        className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                )}
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
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
                        <p className="text-gray-500 font-medium text-lg">Click on the + button to create a new chat</p>
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
            <div className="sticky bottom-0 bg-white border-t border-gray-200">
                {isCreatingChat && (
                    <div className="p-4 border-b border-gray-200 animate-slide-up">
                        <input
                            type="text"
                            value={newChatName}
                            onChange={(e) => setNewChatName(e.target.value)}
                            placeholder="Enter chat name..."
                            className="w-full px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                        />
                    </div>
                )}
                <div className="p-4 flex gap-2 h-20">
                    {isCreatingChat ? (
                        <>
                            <button
                                onClick={handleCreateChat}
                                className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                            >
                                Create Chat
                            </button>
                            <button
                                onClick={handleCancelNewChat}
                                className="py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
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