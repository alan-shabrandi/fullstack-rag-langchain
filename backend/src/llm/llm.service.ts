import { Injectable } from '@nestjs/common';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { HumanMessage, AIMessage } from '@langchain/core/messages';

@Injectable()
export class LlmService {
  private readonly model: ChatGoogleGenerativeAI;

  constructor() {
    this.model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY!,
      model: 'gemini-2.0-flash',
      temperature: 0.7,
    });
  }

  async generateChatResponse(messages: { role: string; content: string }[]) {
    const history = messages.map((msg) => {
      return msg.role === 'USER'
        ? new HumanMessage(msg.content)
        : new AIMessage(msg.content);
    });

    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        'You are a helpful AI assistant. Answer clearly and accurately.',
      ],
      new MessagesPlaceholder('history'),
    ]);

    const chain = prompt.pipe(this.model);

    const result = await chain.invoke({ history });

    // مدیریت خروجی برای جلوگیری از خطای [object Object]
    if (typeof result.content === 'string') {
      return result.content;
    }

    if (Array.isArray(result.content)) {
      return result.content
        .filter((part) => 'text' in part)
        .map((part) => (part as any).text)
        .join('');
    }

    return String(result.content);
  }
}
