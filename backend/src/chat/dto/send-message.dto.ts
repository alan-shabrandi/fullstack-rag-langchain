import { IsString, IsOptional } from 'class-validator';

export class SendMessageDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  chatId?: string; // if not provided, a new chat will be created
}
