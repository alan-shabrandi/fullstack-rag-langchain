import { Module } from '@nestjs/common';

import { AiModule } from './ai/ai.module';
import { ConfigModule } from '@nestjs/config';
import { LlmModule } from './llm/llm.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AiModule,
    LlmModule,
    AuthModule,
  ],
})
export class AppModule {}
