import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VectorSearchService {
  constructor(private readonly prisma: PrismaService) {}

  async similaritySearch(embedding: number[], userId: string, limit = 5) {
    const vector = `[${embedding.join(',')}]`;

    return this.prisma.$queryRawUnsafe(
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
