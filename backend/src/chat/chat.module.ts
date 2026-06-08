import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { PrismaService } from '../prisma/prisma.service';
import { LlmService } from '../llm/llm.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, PrismaService, LlmService],
})
export class ChatModule {}
