import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// تعریف اینترفیس در اینجا (اگر در فایل دیگری تعریف شده، آن را Import کنید)
export interface Chunk {
  id: string;
  documentId: string;
  content: string;
  chunkIndex: number; // این فیلد در کوئری شما وجود دارد
  score: number;
}

@Injectable()
export class VectorSearchService {
  constructor(private readonly prisma: PrismaService) {}

  async similaritySearch(
    embedding: number[],
    userId: string,
    limit = 5,
  ): Promise<Chunk[]> {
    const vector = `[${embedding.join(',')}]`;

    // استفاده از <Chunk[]> برای مشخص کردن خروجی
    return this.prisma.$queryRawUnsafe<Chunk[]>(
      `
      SELECT
          dc.id,
          dc."documentId",
          dc.content,
          dc."chunkIndex",
          1 - (dc.embedding <=> $1::vector) AS score
      FROM "DocumentChunk" dc
      INNER JOIN "Document" d
          ON d.id = dc."documentId"
      WHERE d."userId" = $2
      ORDER BY dc.embedding <=> $1::vector
      LIMIT $3
      `,
      vector,
      userId,
      limit,
    );
  }
}
