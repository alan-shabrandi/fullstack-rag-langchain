import {
  Body,
  Controller,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { ChatDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @Roles('USER', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  async chat(
    @Body() dto: ChatDto,
    @CurrentUser() user: { userId: string; role: string },
  ) {
    const response = await this.aiService.chat(dto.message, user.userId);

    return {
      success: true,
      data: response,
    };
  }
}
