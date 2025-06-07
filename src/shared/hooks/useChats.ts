import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatsStore, type Chat } from '../../entities/Chat/model/chats.store';

export const useChats = () => {
  return useQuery({
    queryKey: ['chats'],
    queryFn: () => chatsStore.getChats(),
    staleTime: Infinity, // Keep data fresh until we invalidate
  });
};

export const useCreateChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string): Promise<Chat> => {
      const newChat = chatsStore.createNewChat(name);
      return newChat;
    },
    onSuccess: () => {
      // Invalidate and refetch chats
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
}; 