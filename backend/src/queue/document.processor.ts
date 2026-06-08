import { Processor, WorkerHost } from '@nestjs/bullmq';

import { Job } from 'bullmq';

import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { PdfService } from '../document/pdf.service';
import { ChunkService } from '../document/chunk.service';

import { DOCUMENT_QUEUE } from './queue.constants';

import { DocumentStatus } from '../generated/prisma';

@Injectable()
@Processor(DOCUMENT_QUEUE)
export class DocumentProcessor extends WorkerHost {
  private readonly logger = new Logger(DocumentProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
    private readonly chunkService: ChunkService,
  ) {
    super();
  }

  async process(job: Job<any>) {
    const { documentId, filePath, mimeType } = job.data;

    try {
      await this.prisma.document.update({
        where: {
          id: documentId,
        },
        data: {
          status: DocumentStatus.PROCESSING,
        },
      });

      if (mimeType !== 'application/pdf') {
        throw new Error('Only PDF currently supported');
      }

      const extractedText = await this.pdfService.extractText(filePath);

      const chunks = await this.chunkService.split(extractedText);

      await this.prisma.documentChunk.createMany({
        data: chunks.map((content, index) => ({
          documentId,
          content,
          chunkIndex: index,
        })),
      });

      await this.prisma.document.update({
        where: {
          id: documentId,
        },
        data: {
          extractedText,
          status: DocumentStatus.COMPLETED,
        },
      });

      this.logger.log(`Document ${documentId} processed successfully`);
    } catch (error) {
      await this.prisma.document.update({
        where: {
          id: documentId,
        },
        data: {
          status: DocumentStatus.FAILED,
        },
      });

      this.logger.error(error);

      throw error;
    }
  }
}
