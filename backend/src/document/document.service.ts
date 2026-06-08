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

    // Validate MIME type
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/markdown',
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Unsupported file type');
    }

    // Ensure folder exists
    fs.mkdirSync(this.uploadFolder, { recursive: true });

    // Save file to local storage
    const filePath = path.join(this.uploadFolder, file.originalname);
    fs.writeFileSync(filePath, file.buffer);

    // Save metadata in DB
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

    await this.queueService.addDocumentJob(document.id, filePath);

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
