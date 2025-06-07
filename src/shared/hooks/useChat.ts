import { useMutation, useQueryClient } from '@tanstack/react-query';
import { messagesStore, type Message } from '../../entities/Message/model/messages.store';
import { chatsStore } from '../../entities/Chat/model/chats.store';

interface SendMessageParams {
  chatId: string;
  text: string;
  chatName: string;
}

export const useChat = () => {
  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation({
    mutationFn: async ({ chatId, text, chatName }: SendMessageParams) => {
      // Create user message
      const userMessage: Message = {
        id: Date.now().toString(),
        text,
        isOutgoing: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        chatId
      };

      // Optimistic update - add user message immediately
      const currentMessages = messagesStore.getMessages(chatId);
      messagesStore['messages'].set(chatId, [...currentMessages, userMessage]);

      // Get AI response
      await messagesStore.sendMessage(chatId, text);

      return messagesStore.getMessages(chatId);
    },
    onMutate: async ({ chatId, text }) => {
      // Cancel any outgoing refetches for messages
      await queryClient.cancelQueries({ queryKey: ['messages', chatId] });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData(['messages', chatId]);

      // Optimistically update to the new value
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        text,
        isOutgoing: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        chatId
      };

      queryClient.setQueryData(['messages', chatId], (old: Message[] = []) => [...old, userMessage]);

      // Return a context object with the snapshotted value
      return { previousMessages };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousMessages) {
        queryClient.setQueryData(['messages', variables.chatId], context.previousMessages);
      }
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['messages', variables.chatId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });

  return {
    sendMessage: sendMessageMutation.mutate,
    isLoading: sendMessageMutation.isPending,
    error: sendMessageMutation.error,
  };
}; 