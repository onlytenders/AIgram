import { useQuery } from '@tanstack/react-query';
import { chatService } from '../services/ChatService';

export const useMessages = (chatId: string | undefined) => {
  return useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => {
      if (!chatId) return [];
      return chatService.getChatMessages(chatId);
    },
    enabled: !!chatId,
    staleTime: Infinity, // Keep data fresh until we invalidate
  });
}; 