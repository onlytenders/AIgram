import OpenAI from 'openai';

export class OpenAIService {
    private static instance: OpenAIService;
    private client: OpenAI | null = null;
    private model = 'gpt-3.5-turbo';

    private constructor() {}

    public static getInstance(): OpenAIService {
        if (!OpenAIService.instance) {
            OpenAIService.instance = new OpenAIService();
        }
        return OpenAIService.instance;
    }

    public async chat(messages: { role: 'user' | 'assistant' | 'system'; content: string }[]): Promise<string> {
        if (!this.client) {
            throw new Error('Please set OpenAI API key first');
        }

        try {
            const completion = await this.client.chat.completions.create({
                messages: messages,
                model: this.model,
            });

            return completion.choices[0].message.content || 'No response generated';
        } catch (error) {
            console.error('Error in chat:', error);
            throw new Error('Failed to get chat response');
        }
    }

    public setApiKey(apiKey: string) {
        if (!apiKey) return;
        
        this.client = new OpenAI({
            apiKey: apiKey,
            dangerouslyAllowBrowser: true
        });
    }
} 