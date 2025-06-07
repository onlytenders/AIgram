import { BaseStore } from '../../../shared/core/BaseStore';
import { globalEventBus } from '../../../shared/core/EventEmitter';
import type { IMessageRepository, IMessage } from '../../../shared/types/interfaces';
import { MessageStatus } from '../../../shared/types/interfaces';
import { MessageEntity } from './Message.entity';

export class MessageRepository extends BaseStore<IMessage> implements IMessageRepository {
  
  protected buildEntity(data: Partial<IMessage>): IMessage {
    if (!MessageEntity.isValidMessageData(data)) {
      throw new Error('Invalid message data provided');
    }
    return new MessageEntity(data).toJSON();
  }

  public getByChatId(chatId: string): IMessage[] {
    return this.getAll()
      .filter(message => message.chatId === chatId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  public updateStatus(messageId: string, status: MessageStatus): void {
    const message = this.getById(messageId);
    if (!message) {
      throw new Error(`Message with ID ${messageId} not found`);
    }

    const messageEntity = new MessageEntity(message);
    messageEntity.updateStatus(status);
    
    this.update(messageId, messageEntity.toJSON());
  }

  public createUserMessage(text: string, chatId: string): IMessage {
    const messageEntity = MessageEntity.createUserMessage({ text, chatId });
    const message = this.create(messageEntity.toJSON());
    
    globalEventBus.emit('message:sent', message);
    return message;
  }

  public createAIMessage(text: string, chatId: string): IMessage {
    const messageEntity = MessageEntity.createAIMessage({ text, chatId });
    const message = this.create(messageEntity.toJSON());
    
    globalEventBus.emit('message:received', message);
    return message;
  }

  public markMessageAsFailed(messageId: string, error?: Error): void {
    try {
      this.updateStatus(messageId, MessageStatus.FAILED);
      
      if (error) {
        globalEventBus.emit('message:failed', { messageId, error });
      }
    } catch (err) {
      console.error('Failed to mark message as failed:', err);
    }
  }

  public deleteChatMessages(chatId: string): number {
    const messages = this.getByChatId(chatId);
    
    let deletedCount = 0;
    messages.forEach(message => {
      if (this.delete(message.id)) {
        deletedCount++;
      }
    });
    
    return deletedCount;
  }

  public getChatStats(chatId: string): {
    totalMessages: number;
    userMessages: number;
    aiMessages: number;
    failedMessages: number;
  } {
    const messages = this.getByChatId(chatId);
    const userMessages = messages.filter(m => m.isOutgoing);
    const aiMessages = messages.filter(m => !m.isOutgoing);
    const failedMessages = messages.filter(m => m.status === MessageStatus.FAILED);

    return {
      totalMessages: messages.length,
      userMessages: userMessages.length,
      aiMessages: aiMessages.length,
      failedMessages: failedMessages.length
    };
  }
}

export const messageRepository = new MessageRepository(); 