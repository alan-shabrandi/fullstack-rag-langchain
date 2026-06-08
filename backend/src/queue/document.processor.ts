import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PdfService } from '../document/pdf.service';
import { DOCUMENT_QUEUE } from './queue.constants';
import { DocumentStatus } from '../generated/prisma';
@Injectable()
@Processor(DOCUMENT_QUEUE)
export class DocumentProcessor extends WorkerHost {
  private readonly logger = new Logger(DocumentProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
  ) {
    super();
  }

  async process(job: Job<any>) {
    const { documentId, filePath } = job.data;

    try {
      await this.prisma.document.update({
        where: { id: documentId },
        data: { status: DocumentStatus.PROCESSING },
      });

      const extractedText = await this.pdfService.extractText(filePath);

      await this.prisma.document.update({
        where: {
          id: documentId,
        },
        data: {
          extractedText,
          status: DocumentStatus.COMPLETED,
        },
      });

      this.logger.log(`Document ${documentId} processed`);
    } catch (error) {
      this.logger.error(error);

      await this.prisma.document.update({
        where: {
          id: documentId,
        },
        data: {
          status: DocumentStatus.FAILED,
        },
      });

      throw error;
    }
  }
}
