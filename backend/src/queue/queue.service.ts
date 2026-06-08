import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';

import { Queue } from 'bullmq';

import { DOCUMENT_QUEUE, DOCUMENT_JOB } from './queue.constants';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue(DOCUMENT_QUEUE)
    private readonly documentQueue: Queue,
  ) {}

  async addDocumentJob(documentId: string, filePath: string, mimeType: string) {
    if (mimeType !== 'application/pdf') {
      throw new Error('Only PDF currently supported');
    }
    return this.documentQueue.add(
      DOCUMENT_JOB.PROCESS,
      {
        documentId,
        filePath,
        mimeType,
      },
      {
        attempts: 5,

        backoff: {
          type: 'exponential',
          delay: 3000,
        },

        removeOnComplete: 100,

        removeOnFail: 500,
      },
    );
  }
}
