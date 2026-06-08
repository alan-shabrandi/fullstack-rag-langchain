import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';

export class ChatDto {
  @ApiProperty({
    description: 'The user message to be sent to the AI',
    example: 'How can I leverage the RAG capabilities of this platform?',
    minLength: 1,
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 2000)
  message: string;

  @IsString()
  @IsOptional()
  chatId?: string;
}
