import { Module } from '@nestjs/common';

import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { PdfService } from './pdf.service';

import { PrismaService } from '../prisma/prisma.service';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [QueueModule],

  controllers: [DocumentController],

  providers: [DocumentService, PdfService, PrismaService],

  exports: [PdfService],
})
export class DocumentModule {}
