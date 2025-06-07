import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../services/ChatService';

interface SendMessageParams {
  chatId: string;
  text: string;
}

export const useChat = () => {
  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation({
    mutationFn: async ({ chatId, text }: SendMessageParams) => {
      return await chatService.sendMessage(chatId, text);
    },
    onMutate: async ({ chatId, text }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['messages', chatId] });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData(['messages', chatId]);

      // Optimistically update with user message
      const optimisticUserMessage = {
        id: `temp-${Date.now()}`,
        text,
        isOutgoing: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        chatId,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'pending' as const
      };

      queryClient.setQueryData(['messages', chatId], (old: any[] = []) => [...old, optimisticUserMessage]);

      return { previousMessages };
    },
    onSuccess: (data, variables) => {
      // Invalidate to get fresh data from service
      queryClient.invalidateQueries({ queryKey: ['messages', variables.chatId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(['messages', variables.chatId], context.previousMessages);
      }
    },
  });

  return {
    sendMessage: sendMessageMutation.mutate,
    sendMessageAsync: sendMessageMutation.mutateAsync,
    isLoading: sendMessageMutation.isPending,
    error: sendMessageMutation.error,
    isSuccess: sendMessageMutation.isSuccess,
    reset: sendMessageMutation.reset
  };
}; 