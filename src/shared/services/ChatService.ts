import type { IAIProvider, IChat, IMessage, IChatMessage } from '../types/interfaces';
import { MessageStatus } from '../types/interfaces';
import { chatRepository } from '../../entities/Chat/model/ChatRepository';
import { messageRepository } from '../../entities/Message/model/MessageRepository';
import { OpenAIProvider } from './OpenAIProvider';
import { globalEventBus } from '../core/EventEmitter';

export class ChatService {
  private aiProvider: IAIProvider;

  constructor(aiProvider?: IAIProvider) {
    this.aiProvider = aiProvider || OpenAIProvider.create();
  }

  // Chat management
  public async createChat(name: string): Promise<IChat> {
    try {
      const chat = chatRepository.createNewChat(name);
      return chat;
    } catch (error) {
      throw new Error(`Failed to create chat: ${(error as Error).message}`);
    }
  }

  public getChats(): IChat[] {
    return chatRepository.getAllSorted();
  }

  public getChat(chatId: string): IChat | undefined {
    return chatRepository.getById(chatId);
  }

  public searchChats(query: string): IChat[] {
    return chatRepository.search(query);
  }

  public deleteChat(chatId: string): boolean {
    // Delete all messages first
    messageRepository.deleteChatMessages(chatId);
    // Then delete the chat
    return chatRepository.delete(chatId);
  }

  // Message management
  public getChatMessages(chatId: string): IMessage[] {
    return messageRepository.getByChatId(chatId);
  }

  public async sendMessage(chatId: string, text: string): Promise<{
    userMessage: IMessage;
    aiMessage: IMessage;
  }> {
    const chat = this.getChat(chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }

    // Create user message
    const userMessage = messageRepository.createUserMessage(text, chatId);

    try {
      // Get conversation history for context
      const messages = this.getChatMessages(chatId);
      const contextMessages: IChatMessage[] = messages
        .filter(m => m.id !== userMessage.id) // Exclude the just-created user message
        .map(msg => ({
          role: msg.isOutgoing ? 'user' as const : 'assistant' as const,
          content: msg.text
        }));

      // Add the current user message
      contextMessages.push({
        role: 'user',
        content: text
      });

      // Get AI response with proper error handling
      let aiResponse: string;
      if (this.aiProvider instanceof OpenAIProvider) {
        aiResponse = await this.aiProvider.chatWithContext(contextMessages, chat.name);
      } else {
        aiResponse = await this.aiProvider.chat(contextMessages);
      }

      // Create AI message
      const aiMessage = messageRepository.createAIMessage(aiResponse, chatId);

      // Update chat with last message
      chatRepository.updateLastMessage(chatId, aiResponse);

      // Mark user message as delivered
      messageRepository.updateStatus(userMessage.id, MessageStatus.DELIVERED);

      return { userMessage, aiMessage };

    } catch (error) {
      // Mark user message as failed
      messageRepository.markMessageAsFailed(userMessage.id, error as Error);
      throw new Error(`Failed to get AI response: ${(error as Error).message}`);
    }
  }

  // AI Provider management
  public setApiKey(apiKey: string): void {
    this.aiProvider.setApiKey(apiKey);
  }

  public isAIConfigured(): boolean {
    return this.aiProvider.isConfigured();
  }

  public switchAIProvider(provider: IAIProvider): void {
    this.aiProvider = provider;
  }

  // Analytics and statistics
  public getChatStatistics(chatId: string): {
    chat: IChat;
    messageStats: {
      totalMessages: number;
      userMessages: number;
      aiMessages: number;
      failedMessages: number;
    };
  } {
    const chat = this.getChat(chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }

    const messageStats = messageRepository.getChatStats(chatId);

    return {
      chat,
      messageStats
    };
  }

  public getOverallStatistics(): {
    totalChats: number;
    totalMessages: number;
    aiConfigured: boolean;
  } {
    const chats = this.getChats();
    const totalMessages = chats.reduce((sum, chat) => {
      return sum + messageRepository.getByChatId(chat.id).length;
    }, 0);

    return {
      totalChats: chats.length,
      totalMessages,
      aiConfigured: this.isAIConfigured()
    };
  }

  // Event handling
  public onChatCreated(callback: (chat: IChat) => void): void {
    globalEventBus.on('chat:created', callback);
  }

  public onChatUpdated(callback: (chat: IChat) => void): void {
    globalEventBus.on('chat:updated', callback);
  }

  public onMessageSent(callback: (message: IMessage) => void): void {
    globalEventBus.on('message:sent', callback);
  }

  public onMessageReceived(callback: (message: IMessage) => void): void {
    globalEventBus.on('message:received', callback);
  }

  public onMessageFailed(callback: (data: { messageId: string; error: Error }) => void): void {
    globalEventBus.on('message:failed', callback);
  }

  // Cleanup
  public removeEventListeners(): void {
    globalEventBus.removeAllListeners();
  }
}

// Singleton instance
export const chatService = new ChatService(); 