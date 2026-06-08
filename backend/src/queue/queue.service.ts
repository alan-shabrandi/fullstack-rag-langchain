import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService {
  public documentQueue: Queue;

  constructor() {
    this.documentQueue = new Queue('document-processing', {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    });
  }

  async addDocumentJob(documentId: string, filePath: string) {
    return this.documentQueue.add('process-document', {
      documentId,
      filePath,
    });
  }
}
