import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { DocumentProcessor } from './document.processor';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [QueueService, DocumentProcessor, PrismaService],
  exports: [QueueService],
})
export class QueueModule {}
