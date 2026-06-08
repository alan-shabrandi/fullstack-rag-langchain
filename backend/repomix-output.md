This file is a merged representation of a subset of the codebase, containing specifically included files, combined into a single document by Repomix.
The content has been processed where comments have been removed, empty lines have been removed.

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
- Only files matching these patterns are included: prisma/schema.prisma, src/app.module.ts, src/chat/chat.module.ts, src/chat/chat.service.ts, src/chat/chat.controller.ts, src/rag/rag.service.ts, src/rag/rag.module.ts, src/retriever/*, src/document/*, src/queue/*, .env, src/main.ts
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Code comments have been removed from supported file types
- Empty lines have been removed from all files
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
prisma/schema.prisma
src/app.module.ts
src/chat/chat.controller.ts
src/chat/chat.module.ts
src/chat/chat.service.ts
src/document/chunk.module.ts
src/document/chunk.service.ts
src/document/document.controller.ts
src/document/document.module.ts
src/document/document.service.ts
src/document/pdf.module.ts
src/document/pdf.service.ts
src/main.ts
src/queue/document.processor.ts
src/queue/queue.constants.ts
src/queue/queue.module.ts
src/queue/queue.service.ts
src/rag/rag.module.ts
src/rag/rag.service.ts
src/retriever/retriever.module.ts
src/retriever/retriever.service.ts
```

# Files

## File: prisma/schema.prisma
```prisma
generator client {
  provider = "prisma-client-js"
  output        = "../src/generated/prisma"
  moduleFormat  = "cjs"
}

datasource db {
  provider = "postgresql"
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  chats     Chat[]
  documents Document[]
}


model Chat {
  id        String   @id @default(uuid())
  title     String?
  userId    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User      @relation(fields: [userId], references: [id])
  messages  Message[]
}

model Message {
  id        String     @id @default(uuid())
  chatId    String
  role      RoleInChat
  content   String
  createdAt DateTime   @default(now())
  chat      Chat       @relation(fields: [chatId], references: [id])
}

model Document {
  id            String         @id @default(uuid())
  userId        String

  fileName      String
  mimeType      String
  fileSize      Int
  storagePath   String
  extractedText String?
  status        DocumentStatus @default(PENDING)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  user          User @relation(fields: [userId], references: [id])
  chunks        DocumentChunk[]
}

model DocumentChunk {
  id         String   @id @default(uuid())
  documentId String
  content    String
  chunkIndex Int
  embeddedAt    DateTime?
  createdAt  DateTime @default(now())
  document   Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  @@index([documentId])
}

enum Role {
  USER
  ADMIN
}

enum RoleInChat {
  USER
  ASSISTANT
}

enum DocumentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}
```

## File: src/app.module.ts
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AiModule } from './ai/ai.module';
import { LlmModule } from './llm/llm.module';
import { QueueModule } from './queue/queue.module';
import { DocumentModule } from './document/document.module';
import { VectorModule } from './vector/vector.module';
import { RetrieverModule } from './retriever/retriever.module';
import { RagModule } from './rag/rag.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    }),
    PrismaModule,
    AuthModule,
    AiModule,
    LlmModule,
    QueueModule,
    DocumentModule,
    VectorModule,
    RetrieverModule,
    RagModule,
  ],
})
export class AppModule {}
```

## File: src/chat/chat.controller.ts
```typescript
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
@Controller('chat')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('USER', 'ADMIN')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}
  @Post('send')
  async sendMessage(
    @Body() dto: SendMessageDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.chatService.sendMessage(user.userId, dto.message, dto.chatId);
  }
  @Get()
  async getChats(@CurrentUser() user: { userId: string }) {
    return this.chatService.getChats(user.userId);
  }
  @Get(':chatId/messages')
  async getMessages(
    @Param('chatId') chatId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.chatService.getMessages(chatId, user.userId);
  }
  @Get('search/:query')
  async search(
    @Param('query') query: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.chatService.testRetrieval(user.userId, query);
  }
}
```

## File: src/chat/chat.module.ts
```typescript
import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { PrismaService } from '../prisma/prisma.service';
import { LlmService } from '../llm/llm.service';
@Module({
  controllers: [ChatController],
  providers: [ChatService, PrismaService, LlmService],
})
export class ChatModule {}
```

## File: src/chat/chat.service.ts
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RetrieverService } from '../retriever/retriever.service';
import { RagService } from '../rag/rag.service';
@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly retrieverService: RetrieverService,
    private readonly ragService: RagService,
  ) {}
  createChat(userId: string) {
    return this.prisma.chat.create({
      data: {
        userId,
      },
    });
  }
  async sendMessage(userId: string, message: string, chatId?: string) {
    let chat: {
      id: string;
      userId: string;
    } | null = null;
    if (chatId) {
      chat = await this.prisma.chat.findUnique({
        where: {
          id: chatId,
        },
      });
      if (!chat) {
        throw new NotFoundException('Chat not found');
      }
      if (chat.userId !== userId) {
        throw new NotFoundException('Chat not found');
      }
    } else {
      chat = await this.createChat(userId);
    }
    const userMessage = await this.prisma.message.create({
      data: {
        chatId: chat.id,
        content: message,
        role: 'USER',
      },
    });
    const messages = await this.prisma.message.findMany({
      where: {
        chatId: chat.id,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    const history = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    const ragResult = await this.ragService.answer(userId, message, history);
    const assistantMessage = await this.prisma.message.create({
      data: {
        chatId: chat.id,
        content: ragResult.answer,
        role: 'ASSISTANT',
      },
    });
    return {
      chatId: chat.id,
      userMessage,
      assistantMessage,
      sources: ragResult.sources,
    };
  }
  getChats(userId: string) {
    return this.prisma.chat.findMany({
      where: { userId },
      include: { messages: true },
      orderBy: { updatedAt: 'desc' },
    });
  }
  async getMessages(chatId: string, userId: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: { messages: true },
    });
    if (!chat || chat.userId !== userId)
      throw new NotFoundException('Chat not found');
    return chat.messages;
  }
  async testRetrieval(userId: string, question: string) {
    return this.retrieverService.retrieve(question, userId, 5);
  }
}
```

## File: src/document/chunk.module.ts
```typescript
import { Module } from '@nestjs/common';
import { ChunkService } from './chunk.service';
@Module({
  providers: [ChunkService],
  exports: [ChunkService],
})
export class ChunkModule {}
```

## File: src/document/chunk.service.ts
```typescript
import { Injectable } from '@nestjs/common';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
@Injectable()
export class ChunkService {
  private splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  async split(text: string) {
    return this.splitter.splitText(text);
  }
}
```

## File: src/document/document.controller.ts
```typescript
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('USER', 'ADMIN')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { userId: string },
  ) {
    const doc = await this.documentService.uploadFile(user.userId, file);
    return { success: true, document: doc };
  }
  @Get()
  async getDocuments(@CurrentUser() user: { userId: string }) {
    const docs = await this.documentService.getDocuments(user.userId);
    return { success: true, documents: docs };
  }
  @Get(':id')
  async getDocument(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    const doc = await this.documentService.getDocument(user.userId, id);
    return { success: true, document: doc };
  }
  @Delete(':id')
  async deleteDocument(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    const doc = await this.documentService.deleteDocument(user.userId, id);
    return { success: true, document: doc };
  }
}
```

## File: src/document/document.module.ts
```typescript
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
```

## File: src/document/document.service.ts
```typescript
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import { QueueService } from '../queue/queue.service';
import { Document, DocumentStatus } from '../generated/prisma';
interface MulterFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}
@Injectable()
export class DocumentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService,
  ) {}
  private uploadFolder = path.join(process.cwd(), 'uploads', 'documents');
  async uploadFile(userId: string, file: MulterFile) {
    if (!file) throw new BadRequestException('No file provided');
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/markdown',
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Unsupported file type');
    }
    fs.mkdirSync(this.uploadFolder, { recursive: true });
    const filePath = path.join(this.uploadFolder, file.originalname);
    fs.writeFileSync(filePath, file.buffer);
    const document: Document = await this.prisma.document.create({
      data: {
        userId,
        fileName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        storagePath: filePath,
        status: DocumentStatus.PENDING,
      },
    });
    await this.queueService.addDocumentJob(
      document.id,
      filePath,
      document.mimeType,
    );
    return document;
  }
  getDocuments(userId: string) {
    return this.prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
  async getDocument(userId: string, documentId: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
    });
    if (!doc || doc.userId !== userId)
      throw new NotFoundException('Document not found');
    return doc;
  }
  async deleteDocument(userId: string, documentId: string) {
    const doc = await this.getDocument(userId, documentId);
    if (fs.existsSync(doc.storagePath)) {
      fs.unlinkSync(doc.storagePath);
    }
    return this.prisma.document.delete({ where: { id: documentId } });
  }
}
```

## File: src/document/pdf.module.ts
```typescript
import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
@Module({
  providers: [PdfService],
  exports: [PdfService],
})
export class PdfModule {}
```

## File: src/document/pdf.service.ts
```typescript
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as pdfParse from 'pdf-parse';
@Injectable()
export class PdfService {
  async extractText(filePath: string): Promise<string> {
    const buffer = fs.readFileSync(filePath);
    const result = await (pdfParse as any)(buffer);
    return result.text;
  }
}
```

## File: src/main.ts
```typescript
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  await app.listen(3001);
}
bootstrap();
```

## File: src/queue/document.processor.ts
```typescript
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
      const extractedText = await this.pdfService.extractText(filePath);
      if (!extractedText?.trim()) {
        throw new Error('No text extracted from PDF');
      }
      const chunks = await this.chunkService.split(extractedText);
      if (!chunks.length) {
        throw new Error('No chunks generated');
      }
      await this.prisma.documentChunk.deleteMany({
        where: {
          documentId,
        },
      });
      for (const [index, chunk] of chunks.entries()) {
        const embedding = await this.embeddingsService.embed(chunk);
        const vector = `[${embedding.join(',')}]`;
        const createdChunk = await this.prisma.documentChunk.create({
          data: {
            documentId,
            content: chunk,
            chunkIndex: index,
            embeddedAt: new Date(),
          },
        });
        await this.prisma.$executeRawUnsafe(
          `
    UPDATE "DocumentChunk"
    SET embedding = $1::vector
    WHERE id = $2
    `,
          vector,
          createdChunk.id,
        );
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
```

## File: src/queue/queue.constants.ts
```typescript
export const DOCUMENT_QUEUE = 'document-processing';
export const DOCUMENT_JOB = {
  PROCESS: 'process-document',
};
```

## File: src/queue/queue.module.ts
```typescript
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QueueService } from './queue.service';
import { DocumentProcessor } from './document.processor';
import { PrismaService } from '../prisma/prisma.service';
import { DOCUMENT_QUEUE } from './queue.constants';
import { PdfModule } from '../document/pdf.module';
import { ChunkModule } from '../document/chunk.module';
import { EmbeddingsModule } from '../embeddings/embeddings.module';
@Module({
  imports: [
    BullModule.registerQueue({ name: DOCUMENT_QUEUE }),
    PdfModule,
    ChunkModule,
    EmbeddingsModule,
  ],
  providers: [QueueService, DocumentProcessor, PrismaService],
  exports: [QueueService],
})
export class QueueModule {}
```

## File: src/queue/queue.service.ts
```typescript
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
```

## File: src/rag/rag.module.ts
```typescript
import { Module } from '@nestjs/common';
import { RagService } from './rag.service';
import { RetrieverModule } from '../retriever/retriever.module';
import { LlmModule } from '../llm/llm.module';
@Module({
  imports: [RetrieverModule, LlmModule],
  providers: [RagService],
  exports: [RagService],
})
export class RagModule {}
```

## File: src/rag/rag.service.ts
```typescript
import { Injectable } from '@nestjs/common';
import { RetrieverService, Chunk } from '../retriever/retriever.service';
import { LlmService } from '../llm/llm.service';
@Injectable()
export class RagService {
  constructor(
    private readonly retrieverService: RetrieverService,
    private readonly llmService: LlmService,
  ) {}
  async answer(
    userId: string,
    question: string,
    history: { role: string; content: string }[],
  ) {
    const chunks: Chunk[] = await this.retrieverService.retrieve(
      question,
      userId,
      5,
    );
    const context = chunks.map((c) => c.content).join('\n\n');
    const answer = await this.llmService.generateRagResponse(
      question,
      context,
      history,
    );
    return {
      answer,
      sources: chunks.map((c) => ({
        documentId: c.documentId,
        chunkId: c.id,
        score: c.score,
      })),
    };
  }
}
```

## File: src/retriever/retriever.module.ts
```typescript
import { Module } from '@nestjs/common';
import { RetrieverService } from './retriever.service';
import { EmbeddingsModule } from '../embeddings/embeddings.module';
import { VectorModule } from '../vector/vector.module';
@Module({
  imports: [EmbeddingsModule, VectorModule],
  providers: [RetrieverService],
  exports: [RetrieverService],
})
export class RetrieverModule {}
```

## File: src/retriever/retriever.service.ts
```typescript
import { Injectable } from '@nestjs/common';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { VectorSearchService } from '../vector/vector-search.service';
export interface Chunk {
  id: string;
  documentId: string;
  content: string;
  score: number;
}
@Injectable()
export class RetrieverService {
  constructor(
    private readonly embeddingsService: EmbeddingsService,
    private readonly vectorSearchService: VectorSearchService,
  ) {}
  async retrieve(question: string, userId: string, topK = 5): Promise<Chunk[]> {
    const queryEmbedding = await this.embeddingsService.embedQuery(question);
    return this.vectorSearchService.similaritySearch(
      queryEmbedding,
      userId,
      topK,
    );
  }
}
```
