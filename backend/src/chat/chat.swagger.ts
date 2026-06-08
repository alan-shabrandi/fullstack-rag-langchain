import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';

export function ApiChatTags() {
  return applyDecorators(ApiTags('Chat'), ApiBearerAuth('JWT'));
}

export function ApiSendMessage() {
  return applyDecorators(
    ApiOperation({ summary: 'Send a new message to a chat' }),
    ApiResponse({ status: 201, description: 'Message sent successfully' }),
  );
}

export function ApiGetChats() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all chats for the current user' }),
    ApiResponse({ status: 200, description: 'List of chats retrieved' }),
  );
}

export function ApiGetMessages() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all messages of a specific chat' }),
    ApiParam({ name: 'chatId', description: 'The ID of the chat' }),
    ApiResponse({ status: 200, description: 'List of messages retrieved' }),
  );
}

export function ApiSearchMessages() {
  return applyDecorators(
    ApiOperation({ summary: 'Search for messages or RAG context' }),
    ApiParam({ name: 'query', description: 'Search term' }),
    ApiResponse({ status: 200, description: 'Search results' }),
  );
}
