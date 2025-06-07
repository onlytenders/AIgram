import type { IAIProvider, IChatMessage } from '../types/interfaces';

export abstract class AIProvider implements IAIProvider {
  protected apiKey: string | null = null;
  protected readonly model: string;
  protected readonly maxRetries: number = 3;
  protected readonly timeout: number = 30000; // 30 seconds

  constructor(model: string) {
    this.model = model;
  }

  // Abstract methods that must be implemented by concrete providers
  public abstract chat(messages: IChatMessage[]): Promise<string>;
  
  // Common interface methods
  public setApiKey(apiKey: string): void {
    this.validateApiKey(apiKey);
    this.apiKey = apiKey;
  }

  public isConfigured(): boolean {
    return !!this.apiKey;
  }

  // Template method for chat with common error handling
  public async chatWithRetry(messages: IChatMessage[]): Promise<string> {
    if (!this.isConfigured()) {
      throw new AIProviderError('API key not configured', 'CONFIGURATION_ERROR');
    }

    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await this.chat(messages);
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === this.maxRetries || !this.isRetryableError(error as Error)) {
          break;
        }
        
        await this.delay(this.getRetryDelay(attempt));
      }
    }

    throw new AIProviderError(
      `Failed after ${this.maxRetries} attempts: ${lastError?.message}`,
      'MAX_RETRIES_EXCEEDED',
      lastError || undefined
    );
  }

  // Protected helper methods for subclasses
  protected validateApiKey(apiKey: string): void {
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      throw new AIProviderError('Invalid API key', 'INVALID_API_KEY');
    }
  }

  protected validateMessages(messages: IChatMessage[]): void {
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new AIProviderError('Messages array cannot be empty', 'INVALID_MESSAGES');
    }

    for (const message of messages) {
      if (!message.role || !message.content) {
        throw new AIProviderError('Invalid message format', 'INVALID_MESSAGE_FORMAT');
      }
    }
  }

  protected isRetryableError(error: Error): boolean {
    // Common retryable errors
    const retryableMessages = [
      'timeout',
      'network',
      'rate limit',
      'server error',
      '429',
      '500',
      '502',
      '503',
      '504'
    ];

    const errorMessage = error.message.toLowerCase();
    return retryableMessages.some(msg => errorMessage.includes(msg));
  }

  protected getRetryDelay(attempt: number): number {
    // Exponential backoff with jitter
    const baseDelay = 1000 * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 0.1 * baseDelay;
    return Math.min(baseDelay + jitter, 30000);
  }

  protected async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Abstract methods for subclasses to implement
  protected abstract getSystemPrompt(chatName: string): string;
  
  // Common functionality
  public getModel(): string {
    return this.model;
  }

  public getMaxRetries(): number {
    return this.maxRetries;
  }
}

// Custom error class for AI provider errors
export class AIProviderError extends Error {
  public readonly code: string;
  public readonly originalError?: Error;

  constructor(message: string, code: string, originalError?: Error) {
    super(message);
    this.name = 'AIProviderError';
    this.code = code;
    this.originalError = originalError;
  }
}

// Factory pattern for creating AI providers
export abstract class AIProviderFactory {
  public static create(type: 'openai' | 'claude', model?: string): AIProvider {
    switch (type) {
      case 'openai':
        // We'll implement this
        throw new Error('OpenAI provider not yet implemented');
      case 'claude':
        throw new Error('Claude provider not yet implemented');
      default:
        throw new Error(`Unknown AI provider type: ${type}`);
    }
  }
} 