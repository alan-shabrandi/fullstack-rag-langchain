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

  async generateChatResponse(
    messages: {
      role: string;
      content: string;
    }[],
  ) {
    const history = messages.map((msg) =>
      msg.role === 'USER'
        ? new HumanMessage(msg.content)
        : new AIMessage(msg.content),
    );

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', 'You are a helpful AI assistant.'],
      new MessagesPlaceholder('history'),
    ]);

    const chain = prompt.pipe(this.model);

    const result = await chain.invoke({
      history,
    });

    return this.extractText(result.content);
  }

  async generateRagResponse(
    question: string,
    context: string,
    history: {
      role: string;
      content: string;
    }[],
  ) {
    const messages = history.map((msg) =>
      msg.role === 'USER'
        ? new HumanMessage(msg.content)
        : new AIMessage(msg.content),
    );

    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `
You are a RAG assistant.

Answer ONLY using the provided context.

If the answer is not contained in the context,
say:

"I could not find that information in the uploaded documents."

Context:

{context}
          `,
      ],

      new MessagesPlaceholder('history'),

      ['human', '{question}'],
    ]);

    const chain = prompt.pipe(this.model);

    const result = await chain.invoke({
      context,
      question,
      history: messages,
    });

    return this.extractText(result.content);
  }

  private extractText(content: any) {
    if (typeof content === 'string') {
      return content;
    }

    if (Array.isArray(content)) {
      return content
        .filter((p) => 'text' in p)
        .map((p: any) => p.text)
        .join('');
    }

    return String(content);
  }
}
