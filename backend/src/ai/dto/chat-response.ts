import { ApiProperty } from '@nestjs/swagger';

export class ChatResponseDto {
  @ApiProperty({
    example: true,
    description: 'Indicates if the request was successful',
  })
  success: boolean;

  @ApiProperty({
    example: 'Based on your documents, the RAG feature allows you to...',
    description: 'The AI generated response',
  })
  data: string;
}
