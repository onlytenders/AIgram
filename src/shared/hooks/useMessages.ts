import { useQuery } from '@tanstack/react-query';
import { messagesStore } from '../../entities/Message/model/messages.store';

export const useMessages = (chatId: string | undefined) => {
  return useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => {
      if (!chatId) return [];
      return messagesStore.getMessages(chatId);
    },
    enabled: !!chatId,
    refetchInterval: false, // Don't auto-refetch since we handle updates manually
    staleTime: Infinity, // Keep data fresh until we invalidate
  });
}; 