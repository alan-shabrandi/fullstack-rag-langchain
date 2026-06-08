import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VectorSearchService {
  constructor(private readonly prisma: PrismaService) {}

  async similaritySearch(embedding: number[], limit = 5) {
    const vector = `[${embedding.join(',')}]`;

    const result = await this.prisma.$queryRawUnsafe(
      `
      SELECT
        id,
        "documentId",
        content,
        "chunkIndex",
        1 - (embedding <=> $1::vector) AS score
      FROM "DocumentChunk"
      ORDER BY embedding <=> $1::vector
      LIMIT $2
      `,
      vector,
      limit,
    );

    return result;
  }
}
