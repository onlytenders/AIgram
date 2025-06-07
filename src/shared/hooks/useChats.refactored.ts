import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../services/ChatService';
import type { IChat } from '../types/interfaces';

export const useChats = () => {
  return useQuery({
    queryKey: ['chats'],
    queryFn: () => chatService.getChats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string): Promise<IChat> => {
      return await chatService.createChat(name);
    },
    onSuccess: () => {
      // Invalidate and refetch chats
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
};

export const useDeleteChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chatId: string): Promise<boolean> => {
      return chatService.deleteChat(chatId);
    },
    onSuccess: () => {
      // Invalidate both chats and any message queries
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
};

export const useSearchChats = (query: string) => {
  return useQuery({
    queryKey: ['chats', 'search', query],
    queryFn: () => chatService.searchChats(query),
    enabled: !!query.trim(),
    staleTime: 1000 * 30, // 30 seconds
  });
};

export const useChatStatistics = (chatId: string) => {
  return useQuery({
    queryKey: ['chat-stats', chatId],
    queryFn: () => chatService.getChatStatistics(chatId),
    enabled: !!chatId,
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useOverallStatistics = () => {
  return useQuery({
    queryKey: ['overall-stats'],
    queryFn: () => chatService.getOverallStatistics(),
    staleTime: 1000 * 60, // 1 minute
  });
}; 