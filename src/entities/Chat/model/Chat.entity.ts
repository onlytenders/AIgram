import type { IChat } from '../../../shared/types/interfaces';

export class ChatEntity implements IChat {
  public readonly id: string;
  public readonly createdAt: Date;
  public updatedAt: Date;
  public name: string;
  public lastMessage?: string;
  public timestamp?: string;
  public isOnline: boolean;

  constructor(data: Partial<IChat> & { name: string }) {
    this.id = data.id || this.generateId();
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.name = data.name;
    this.lastMessage = data.lastMessage;
    this.timestamp = data.timestamp || this.getCurrentTimestamp();
    this.isOnline = data.isOnline ?? true;
  }

  // Business logic methods
  public updateLastMessage(message: string): void {
    this.lastMessage = message;
    this.timestamp = this.getCurrentTimestamp();
    this.updatedAt = new Date();
  }

  public setOnlineStatus(isOnline: boolean): void {
    this.isOnline = isOnline;
    this.updatedAt = new Date();
  }

  public getDisplayName(): string {
    return this.name;
  }

  public getLastMessagePreview(maxLength: number = 30): string {
    if (!this.lastMessage) return '* Empty chat *';
    if (this.lastMessage.length <= maxLength) return this.lastMessage;
    return this.lastMessage.substring(0, maxLength) + '...';
  }

  public hasMessages(): boolean {
    return !!this.lastMessage;
  }

  // Validation methods
  public isValidName(name: string): boolean {
    return name.trim().length > 0 && name.trim().length <= 100;
  }

  public updateName(newName: string): void {
    if (!this.isValidName(newName)) {
      throw new Error('Invalid chat name');
    }
    this.name = newName.trim();
    this.updatedAt = new Date();
  }

  // Serialization
  public toJSON(): IChat {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      name: this.name,
      lastMessage: this.lastMessage,
      timestamp: this.timestamp,
      isOnline: this.isOnline
    };
  }

  // Private utility methods
  private generateId(): string {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentTimestamp(): string {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Factory method
  public static create(data: { name: string }): ChatEntity {
    return new ChatEntity(data);
  }

  // Static validation
  public static isValidChatData(data: any): data is Partial<IChat> & { name: string } {
    return typeof data === 'object' && 
           typeof data.name === 'string' && 
           data.name.trim().length > 0;
  }
} 