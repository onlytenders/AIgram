import type { IMessage } from '../../../shared/types/interfaces';
import { MessageStatus } from '../../../shared/types/interfaces';

export class MessageEntity implements IMessage {
  public readonly id: string;
  public readonly createdAt: Date;
  public updatedAt: Date;
  public text: string;
  public isOutgoing: boolean;
  public timestamp: string;
  public chatId: string;
  public status: MessageStatus;

  constructor(data: Partial<IMessage> & { text: string; isOutgoing: boolean; chatId: string }) {
    this.id = data.id || this.generateId();
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.text = data.text;
    this.isOutgoing = data.isOutgoing;
    this.chatId = data.chatId;
    this.timestamp = data.timestamp || this.getCurrentTimestamp();
    this.status = data.status || (data.isOutgoing ? MessageStatus.SENT : MessageStatus.DELIVERED);
  }

  // Business logic methods
  public updateStatus(status: MessageStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  public updateText(newText: string): void {
    if (!this.isValidText(newText)) {
      throw new Error('Invalid message text');
    }
    this.text = newText.trim();
    this.updatedAt = new Date();
  }

  public markAsFailed(): void {
    this.updateStatus(MessageStatus.FAILED);
  }

  public markAsDelivered(): void {
    this.updateStatus(MessageStatus.DELIVERED);
  }

  public isPending(): boolean {
    return this.status === MessageStatus.PENDING;
  }

  public isFailed(): boolean {
    return this.status === MessageStatus.FAILED;
  }

  public isDelivered(): boolean {
    return this.status === MessageStatus.DELIVERED || this.status === MessageStatus.SENT;
  }

  public getDisplayText(maxLength?: number): string {
    if (!maxLength) return this.text;
    if (this.text.length <= maxLength) return this.text;
    return this.text.substring(0, maxLength) + '...';
  }

  public getFormattedTimestamp(): string {
    return this.timestamp;
  }

  public belongsToChat(chatId: string): boolean {
    return this.chatId === chatId;
  }

  // Validation methods
  public isValidText(text: string): boolean {
    return typeof text === 'string' && text.trim().length > 0 && text.length <= 4000;
  }

  // Serialization
  public toJSON(): IMessage {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      text: this.text,
      isOutgoing: this.isOutgoing,
      timestamp: this.timestamp,
      chatId: this.chatId,
      status: this.status
    };
  }

  // Private utility methods
  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentTimestamp(): string {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Factory methods
  public static createUserMessage(data: { text: string; chatId: string }): MessageEntity {
    return new MessageEntity({
      ...data,
      isOutgoing: true,
      status: MessageStatus.PENDING
    });
  }

  public static createAIMessage(data: { text: string; chatId: string }): MessageEntity {
    return new MessageEntity({
      ...data,
      isOutgoing: false,
      status: MessageStatus.DELIVERED
    });
  }

  // Static validation
  public static isValidMessageData(data: any): data is Partial<IMessage> & { text: string; isOutgoing: boolean; chatId: string } {
    return typeof data === 'object' && 
           typeof data.text === 'string' && 
           typeof data.isOutgoing === 'boolean' &&
           typeof data.chatId === 'string' &&
           data.text.trim().length > 0;
  }
} 