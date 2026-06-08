import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RetrieverService } from '../retriever/retriever.service';
import { RagService } from '../rag/rag.service';
@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly retrieverService: RetrieverService,
    private readonly ragService: RagService,
  ) {}

  // Create a new chat
  createChat(userId: string) {
    return this.prisma.chat.create({
      data: {
        userId,
      },
    });
  }

  // Send a message (user message + assistant response)
  async sendMessage(userId: string, message: string, chatId?: string) {
    let chat: {
      id: string;
      userId: string;
    } | null = null;

    if (chatId) {
      chat = await this.prisma.chat.findUnique({
        where: {
          id: chatId,
        },
      });

      if (!chat) {
        throw new NotFoundException('Chat not found');
      }

      if (chat.userId !== userId) {
        throw new NotFoundException('Chat not found');
      }
    } else {
      chat = await this.createChat(userId);
    }

    const userMessage = await this.prisma.message.create({
      data: {
        chatId: chat.id,
        content: message,
        role: 'USER',
      },
    });

    const messages = await this.prisma.message.findMany({
      where: {
        chatId: chat.id,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const history = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const ragResult = await this.ragService.answer(userId, message, history);

    const assistantMessage = await this.prisma.message.create({
      data: {
        chatId: chat.id,
        content: ragResult.answer,
        role: 'ASSISTANT',
      },
    });

    return {
      chatId: chat.id,

      userMessage,

      assistantMessage,

      sources: ragResult.sources,
    };
  }

  // Get all chats for a user
  getChats(userId: string) {
    return this.prisma.chat.findMany({
      where: { userId },
      include: { messages: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  // Get messages for a chat
  async getMessages(chatId: string, userId: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: { messages: true },
    });
    if (!chat || chat.userId !== userId)
      throw new NotFoundException('Chat not found');
    return chat.messages;
  }

  async testRetrieval(userId: string, question: string) {
    return this.retrieverService.retrieve(question, userId, 5);
  }
}
