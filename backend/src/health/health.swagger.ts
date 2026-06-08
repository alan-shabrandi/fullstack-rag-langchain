import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

export function ApiHealthTags() {
  return applyDecorators(ApiTags('Health'));
}

export function ApiCheckHealth() {
  return applyDecorators(
    ApiOperation({ summary: 'Check the health status of the API' }),
    ApiResponse({
      status: 200,
      description: 'API is healthy',
      schema: {
        example: {
          status: 'ok',
          timestamp: '2026-06-08T21:37:47.000Z',
        },
      },
    }),
  );
}
