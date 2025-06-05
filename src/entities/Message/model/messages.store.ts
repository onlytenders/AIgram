import { chatsStore } from "../../Chat/model/chats.store";
import { OpenAIService } from "../../../shared/api/openai.service";

export interface Message {
    id: string;
    text: string;
    isOutgoing: boolean;
    timestamp: string;
    chatId: string;
}

class MessagesStore {
    private messages: Map<string, Message[]> = new Map();
    private openai: OpenAIService;

    constructor() {
        this.openai = OpenAIService.getInstance();
    }

    setApiKey(apiKey: string) {
        this.openai.setApiKey(apiKey);
    }

    getMessages(chatId: string): Message[] {
        return this.messages.get(chatId) || [];
    }

    private getSystemPrompt(chatName: string): string {
        return `You are ${chatName}. Act accordingly, staying in character and providing responses that would be expected from ${chatName}. Keep responses concise and natural, as if in a real chat conversation.`;
    }

    async sendMessage(chatId: string, text: string): Promise<void> {
        const chat = chatsStore.getChat(chatId);
        if (!chat) return;

        // Create and save user message
        const userMessage: Message = {
            id: Date.now().toString(),
            text,
            isOutgoing: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            chatId
        };

        const chatMessages = this.getMessages(chatId);
        
        // Get chat history for context
        const messageHistory = [
            // Add system message for role
            { role: 'system' as const, content: this.getSystemPrompt(chat.name) },
            // Add chat history
            ...chatMessages.map(msg => ({
                role: msg.isOutgoing ? 'user' as const : 'assistant' as const,
                content: msg.text
            })),
            // Add current message
            { role: 'user' as const, content: text }
        ];

        // Save user message
        this.messages.set(chatId, [...chatMessages, userMessage]);
        
        try {
            // Get AI response
            const aiResponse = await this.openai.chat(messageHistory);

            // Create and save AI message
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: aiResponse,
                isOutgoing: false,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                chatId
            };

            // Update messages with AI response
            this.messages.set(chatId, [...this.getMessages(chatId), aiMessage]);

            // Update the last message in the chat
            chatsStore.updateLastMessage(chatId, aiResponse);

            // Dispatch event to notify about chat update
            window.dispatchEvent(new CustomEvent('chatUpdate'));

        } catch (error) {
            console.error('Error getting AI response:', error);
            throw error;
        }
    }
}

export const messagesStore = new MessagesStore(); 