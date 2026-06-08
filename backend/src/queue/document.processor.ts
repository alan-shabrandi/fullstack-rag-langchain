import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { PdfService } from '../document/pdf.service';
import { ChunkService } from '../document/chunk.service';

import { EmbeddingsService } from '../embeddings/embeddings.service';

import { DOCUMENT_QUEUE } from './queue.constants';

import { DocumentStatus } from '../generated/prisma';

interface ProcessDocumentJob {
  documentId: string;
  filePath: string;
  mimeType: string;
}

@Injectable()
@Processor(DOCUMENT_QUEUE)
export class DocumentProcessor extends WorkerHost {
  private readonly logger = new Logger(DocumentProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
    private readonly chunkService: ChunkService,
    private readonly embeddingsService: EmbeddingsService,
  ) {
    super();
  }

  async process(job: Job<ProcessDocumentJob>): Promise<void> {
    const { documentId, filePath, mimeType } = job.data;

    try {
      this.logger.log(`Starting processing for document ${documentId}`);

      await this.prisma.document.update({
        where: { id: documentId },
        data: {
          status: DocumentStatus.PROCESSING,
        },
      });

      if (mimeType !== 'application/pdf') {
        throw new Error(
          `Unsupported mime type: ${mimeType}. Only PDF is currently supported.`,
        );
      }

      // Extract text from PDF
      const extractedText = await this.pdfService.extractText(filePath);

      if (!extractedText?.trim()) {
        throw new Error('No text extracted from PDF');
      }

      // Split into chunks
      const chunks = await this.chunkService.split(extractedText);

      if (!chunks.length) {
        throw new Error('No chunks generated');
      }

      // Remove old chunks if document is reprocessed
      await this.prisma.documentChunk.deleteMany({
        where: {
          documentId,
        },
      });

      // Generate embeddings and store chunks
      for (const [index, chunk] of chunks.entries()) {
        const embedding = await this.embeddingsService.embed(chunk);

        await this.prisma.documentChunk.create({
          data: {
            documentId,
            content: chunk,
            chunkIndex: index,

            // Requires schema update:
            // embedding Json?
            // embeddedAt DateTime?
            embedding,
            embeddedAt: new Date(),
          },
        });

        // Prevent hitting Gemini rate limits
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      await this.prisma.document.update({
        where: {
          id: documentId,
        },
        data: {
          extractedText,
          status: DocumentStatus.COMPLETED,
        },
      });

      this.logger.log(
        `Document ${documentId} processed successfully. ${chunks.length} chunks created.`,
      );
    } catch (error) {
      this.logger.error(
        `Document ${documentId} processing failed`,
        error instanceof Error ? error.stack : String(error),
      );

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
