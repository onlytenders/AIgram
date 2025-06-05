export interface Chat {
    id: string;
    name: string;
    lastMessage?: string;
    timestamp?: string;
    isOnline: boolean;
}

class ChatsStore {
    private chats: Map<string, Chat> = new Map();

    getChats(): Chat[] {
        return Array.from(this.chats.values()).sort((a, b) => {
            if (!a.timestamp || !b.timestamp) return 0;
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
    }

    getChat(id: string): Chat | undefined {
        return this.chats.get(id);
    }

    createNewChat(name: string): Chat {
        const newChat: Chat = {
            id: Date.now().toString(),
            name,
            isOnline: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        this.chats.set(newChat.id, newChat);
        return newChat;
    }

    updateLastMessage(chatId: string, message: string) {
        const chat = this.chats.get(chatId);
        if (chat) {
            chat.lastMessage = message;
            chat.timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            this.chats.set(chatId, chat);
        }
    }
}

export const chatsStore = new ChatsStore(); 