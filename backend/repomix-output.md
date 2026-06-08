This file is a merged representation of a subset of the codebase, containing specifically included files, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: src/queue/queue.service.ts, src/queue/queue.module.ts, src/document/processors/document.processor.ts, docker-compose.yml
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
src/queue/queue.module.ts
src/queue/queue.service.ts
```

# Files

## File: src/queue/queue.module.ts
```typescript
import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { DocumentProcessor } from './document.processor';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [QueueService, DocumentProcessor, PrismaService],
  exports: [QueueService],
})
export class QueueModule {}
```

## File: src/queue/queue.service.ts
```typescript
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
```
