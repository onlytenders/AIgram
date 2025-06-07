// Core entity interfaces
export interface IEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChat extends IEntity {
  name: string;
  lastMessage?: string;
  timestamp?: string;
  isOnline: boolean;
}

export interface IMessage extends IEntity {
  text: string;
  isOutgoing: boolean;
  timestamp: string;
  chatId: string;
  status: MessageStatus;
}

export enum MessageStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed'
}

// Service interfaces for dependency injection
export interface IAIProvider {
  chat(messages: IChatMessage[]): Promise<string>;
  setApiKey(apiKey: string): void;
  isConfigured(): boolean;
}

export interface IChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Store interfaces
export interface IStore<T> {
  getAll(): T[];
  getById(id: string): T | undefined;
  create(data: Partial<T>): T;
  update(id: string, data: Partial<T>): T | undefined;
  delete(id: string): boolean;
}

// Repository pattern interfaces
export interface IChatRepository extends IStore<IChat> {
  findByName(name: string): IChat[];
  updateLastMessage(chatId: string, message: string): void;
}

export interface IMessageRepository extends IStore<IMessage> {
  getByChatId(chatId: string): IMessage[];
  updateStatus(messageId: string, status: MessageStatus): void;
}

// Event system interfaces
export interface IEventEmitter {
  on(event: string, callback: Function): void;
  off(event: string, callback: Function): void;
  emit(event: string, data?: any): void;
}

export interface IChatEvents {
  'chat:created': IChat;
  'chat:updated': IChat;
  'message:sent': IMessage;
  'message:received': IMessage;
  'message:failed': { messageId: string; error: Error };
}

// Re-export theme interfaces for convenience
export type {
  ITheme,
  IThemeColors,
  IThemeStore,
  IThemeStorage
} from './theme.interfaces';

export { ThemeMode } from './theme.interfaces'; 