import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AiModule } from './ai/ai.module';
import { LlmModule } from './llm/llm.module';

import { QueueModule } from './queue/queue.module';
import { DocumentModule } from './document/document.module';
import { VectorModule } from './vector/vector.module';
import { RetrieverModule } from './retriever/retriever.module';
import { RagModule } from './rag/rag.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    }),

    PrismaModule,

    AuthModule,

    AiModule,

    LlmModule,

    QueueModule,

    DocumentModule,
    VectorModule,
    RetrieverModule,
    RagModule,
    HealthModule,
  ],
})
export class AppModule {}
