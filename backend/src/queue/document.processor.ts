import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import * as fs from 'fs';
import * as pdfParse from 'pdf-parse';
import { PrismaService } from '../prisma/prisma.service';

@Processor('document-processing')
export class DocumentProcessor extends WorkerHost {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job): Promise<void> {
    const { documentId, filePath } = job.data as {
      documentId: string;
      filePath: string;
    };

    // Update status → PROCESSING
    await this.prisma.document.update({
      where: { id: documentId },
      data: { status: 'PROCESSING' },
    });

    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await (pdfParse as any)(dataBuffer);
      const text = data.text;

      console.log(`Processed text length: ${text.length}`);

      // Update status → COMPLETED
      await this.prisma.document.update({
        where: { id: documentId },
        data: { status: 'COMPLETED' },
      });
    } catch (err) {
      console.error(err);
      await this.prisma.document.update({
        where: { id: documentId },
        data: { status: 'FAILED' },
      });
      throw err;
    }
  }
}
