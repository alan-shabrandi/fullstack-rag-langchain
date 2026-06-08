import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';
import { ChatResponseDto } from './dto/chat-response';

export function ApiAiTags() {
  return applyDecorators(ApiTags('RAG'), ApiBearerAuth('JWT'));
}

export function ApiChatOperation() {
  return applyDecorators(
    ApiOperation({ summary: 'Send a message to the AI chatbot' }),
    ApiResponse({
      status: 200,
      description: 'The response from the AI',
      type: ChatResponseDto,
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
}
