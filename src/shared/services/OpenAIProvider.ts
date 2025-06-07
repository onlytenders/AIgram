import OpenAI from 'openai';
import { AIProvider, AIProviderError } from './AIProvider.abstract';
import type { IChatMessage } from '../types/interfaces';

export class OpenAIProvider extends AIProvider {
  private client: OpenAI | null = null;

  constructor(model: string = 'gpt-3.5-turbo') {
    super(model);
  }

  public setApiKey(apiKey: string): void {
    super.setApiKey(apiKey);
    this.initializeClient();
  }

  public async chat(messages: IChatMessage[]): Promise<string> {
    this.validateMessages(messages);
    
    if (!this.client) {
      throw new AIProviderError('OpenAI client not initialized', 'CLIENT_NOT_INITIALIZED');
    }

    try {
      const completion = await this.client.chat.completions.create({
        messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
        model: this.model,
        max_tokens: 1000,
        temperature: 0.7
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        throw new AIProviderError('No response generated', 'EMPTY_RESPONSE');
      }

      return response;
    } catch (error) {
      if (error instanceof AIProviderError) {
        throw error;
      }
      
      const openAiError = error as any;
      const errorMessage = openAiError.message || 'Unknown OpenAI error';
      const errorCode = this.mapOpenAIErrorCode(openAiError);
      
      throw new AIProviderError(errorMessage, errorCode, openAiError);
    }
  }

  protected getSystemPrompt(chatName: string): string {
    return `You are ${chatName}. Act accordingly, staying in character and providing responses that would be expected from ${chatName}. Keep responses concise and natural, as if in a real chat conversation.`;
  }

  public async chatWithContext(messages: IChatMessage[], chatName: string): Promise<string> {
    const systemMessage: IChatMessage = {
      role: 'system',
      content: this.getSystemPrompt(chatName)
    };

    const messagesWithContext = [systemMessage, ...messages];
    return this.chatWithRetry(messagesWithContext);
  }

  private initializeClient(): void {
    if (!this.apiKey) {
      throw new AIProviderError('API key required', 'MISSING_API_KEY');
    }

    try {
      this.client = new OpenAI({
        apiKey: this.apiKey,
        dangerouslyAllowBrowser: true
      });
    } catch (error) {
      throw new AIProviderError('Failed to initialize OpenAI client', 'INITIALIZATION_FAILED', error as Error);
    }
  }

  private mapOpenAIErrorCode(error: any): string {
    if (error.status) {
      switch (error.status) {
        case 401:
          return 'INVALID_API_KEY';
        case 429:
          return 'RATE_LIMIT_EXCEEDED';
        case 500:
        case 502:
        case 503:
        case 504:
          return 'SERVER_ERROR';
        default:
          return 'API_ERROR';
      }
    }

    if (error.code) {
      switch (error.code) {
        case 'insufficient_quota':
          return 'QUOTA_EXCEEDED';
        case 'model_not_found':
          return 'MODEL_NOT_FOUND';
        default:
          return 'API_ERROR';
      }
    }

    return 'UNKNOWN_ERROR';
  }

  // Static factory method
  public static create(model?: string): OpenAIProvider {
    return new OpenAIProvider(model);
  }
} 