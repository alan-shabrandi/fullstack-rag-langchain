import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('chat')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('USER', 'ADMIN')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('send')
  async sendMessage(
    @Body() dto: SendMessageDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.chatService.sendMessage(user.userId, dto.message, dto.chatId);
  }

  @Get()
  async getChats(@CurrentUser() user: { userId: string }) {
    return this.chatService.getChats(user.userId);
  }

  @Get(':chatId/messages')
  async getMessages(
    @Param('chatId') chatId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.chatService.getMessages(chatId, user.userId);
  }
}
