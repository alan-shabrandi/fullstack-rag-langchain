import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QueueService } from './queue.service';
import { DocumentProcessor } from './document.processor';
import { PrismaService } from '../prisma/prisma.service';
import { DOCUMENT_QUEUE } from './queue.constants';
import { PdfModule } from '../document/pdf.module';
@Module({
  imports: [BullModule.registerQueue({ name: DOCUMENT_QUEUE }), PdfModule],
  providers: [QueueService, DocumentProcessor, PrismaService],
  exports: [QueueService],
})
export class QueueModule {}
