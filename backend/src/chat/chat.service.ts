import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LlmService } from '../llm/llm.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly llmService: LlmService,
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
    let chat: { id: string; userId: string } | null = null;

    if (chatId) {
      chat = await this.prisma.chat.findUnique({
        where: { id: chatId },
        include: { messages: true },
      });
      if (!chat) throw new NotFoundException('Chat not found');
    } else {
      chat = await this.createChat(userId);
    }

    // Save user message
    const userMessage = await this.prisma.message.create({
      data: {
        chatId: chat.id,
        content: message,
        role: 'USER',
      },
    });

    // Fetch previous messages for context
    const messages = await this.prisma.message.findMany({
      where: { chatId: chat.id },
      orderBy: { createdAt: 'asc' },
    });

    const context = messages.map((m) => ({
      role: m.role.toLowerCase(),
      content: m.content,
    }));
    // Generate assistant response
    const assistantContent =
      await this.llmService.generateChatResponse(context);

    // Save assistant message
    const assistantMessage = await this.prisma.message.create({
      data: {
        chatId: chat.id,
        content: assistantContent,
        role: 'ASSISTANT',
      },
    });

    return {
      chatId: chat.id,
      userMessage,
      assistantMessage,
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
}
