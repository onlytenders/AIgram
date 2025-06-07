// Refactored hooks using service layer
export { useChat } from './useChat.refactored';
export { 
  useChats, 
  useCreateChat, 
  useDeleteChat, 
  useSearchChats, 
  useChatStatistics, 
  useOverallStatistics 
} from './useChats.refactored';
export { useMessages } from './useMessages.refactored';

// Re-export types for convenience
export type { IChat, IMessage, MessageStatus } from '../types/interfaces'; 