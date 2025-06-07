import { BaseStore } from '../../../shared/core/BaseStore';
import { globalEventBus } from '../../../shared/core/EventEmitter';
import type { IChatRepository, IChat } from '../../../shared/types/interfaces';
import { ChatEntity } from './Chat.entity';

export class ChatRepository extends BaseStore<IChat> implements IChatRepository {
  
  protected buildEntity(data: Partial<IChat>): IChat {
    if (!ChatEntity.isValidChatData(data)) {
      throw new Error('Invalid chat data provided');
    }
    return new ChatEntity(data).toJSON();
  }

  // IChatRepository specific methods
  public findByName(name: string): IChat[] {
    const lowercaseName = name.toLowerCase();
    return this.getAll().filter(chat => 
      chat.name.toLowerCase().includes(lowercaseName)
    );
  }

  public updateLastMessage(chatId: string, message: string): void {
    const chat = this.getById(chatId);
    if (!chat) {
      throw new Error(`Chat with ID ${chatId} not found`);
    }

    const chatEntity = new ChatEntity(chat);
    chatEntity.updateLastMessage(message);
    
    this.update(chatId, chatEntity.toJSON());
  }

  public createNewChat(name: string): IChat {
    if (!name || name.trim().length === 0) {
      throw new Error('Chat name cannot be empty');
    }

    // Check for duplicate names
    const existingChats = this.findByName(name.trim());
    if (existingChats.length > 0) {
      throw new Error('A chat with this name already exists');
    }

    return this.create({ name: name.trim() });
  }

  // Enhanced sorting
  public getAllSorted(): IChat[] {
    return this.getAll().sort((a, b) => {
      // Sort by last activity (timestamp), then by creation date
      if (a.timestamp && b.timestamp) {
        const timeA = this.parseTimestamp(a.timestamp);
        const timeB = this.parseTimestamp(b.timestamp);
        return timeB.getTime() - timeA.getTime();
      }
      
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  // Search functionality
  public search(query: string): IChat[] {
    if (!query || query.trim().length === 0) {
      return this.getAllSorted();
    }

    const lowercaseQuery = query.toLowerCase().trim();
    
    return this.getAllSorted().filter(chat => {
      const nameMatch = chat.name.toLowerCase().includes(lowercaseQuery);
      const messageMatch = chat.lastMessage?.toLowerCase().includes(lowercaseQuery) || false;
      return nameMatch || messageMatch;
    });
  }

  // Statistics
  public getStats(): {
    totalChats: number;
    chatsWithMessages: number;
    averageMessagesPerChat: number;
  } {
    const chats = this.getAll();
    const chatsWithMessages = chats.filter(chat => chat.lastMessage).length;
    
    return {
      totalChats: chats.length,
      chatsWithMessages,
      averageMessagesPerChat: chatsWithMessages > 0 ? chatsWithMessages / chats.length : 0
    };
  }

  // Event handlers (override from BaseStore)
  protected onEntityCreated(entity: IChat): void {
    globalEventBus.emit('chat:created', entity);
  }

  protected onEntityUpdated(entity: IChat): void {
    globalEventBus.emit('chat:updated', entity);
  }

  protected onEntityDeleted(entity: IChat): void {
    // Could emit chat:deleted event if needed
  }

  // Private utility methods
  private parseTimestamp(timestamp: string): Date {
    // Convert "HH:MM" format to today's date with that time
    const [hours, minutes] = timestamp.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }
}

// Singleton instance
export const chatRepository = new ChatRepository(); 