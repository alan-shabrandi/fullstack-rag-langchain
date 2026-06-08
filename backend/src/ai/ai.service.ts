import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LlmService } from '../llm/llm.service';

@Injectable()
export class AiService {
  constructor(
    private readonly llmService: LlmService,
    private readonly prisma: PrismaService,
  ) {}

  async chat(message: string, userId: string, chatId?: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        let activeChatId = chatId;
        if (!activeChatId) {
          const newChat = await tx.chat.create({ data: { userId } });
          activeChatId = newChat.id;
        }

        await tx.message.create({
          data: { content: message, role: 'USER', chatId: activeChatId },
        });

        const responseText = await this.llmService.generateChatResponse([
          { role: 'user', content: message },
        ]);

        await tx.message.create({
          data: {
            content: responseText,
            role: 'ASSISTANT',
            chatId: activeChatId,
          },
        });

        return { response: responseText, chatId: activeChatId };
      });
    } catch (error) {
      console.error('AI Chat Error:', error);
      throw new InternalServerErrorException('خطا در پردازش هوش مصنوعی');
    }
  }
}
