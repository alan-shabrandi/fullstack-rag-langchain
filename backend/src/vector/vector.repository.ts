import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VectorRepository {
  constructor(private readonly prisma: PrismaService) {}

  async updateEmbedding(chunkId: string, embedding: number[]) {
    const vector = `[${embedding.join(',')}]`;

    await this.prisma.$executeRawUnsafe(
      `
      UPDATE "DocumentChunk"
      SET embedding = $1::vector
      WHERE id = $2
      `,
      vector,
      chunkId,
    );
  }

  async search(embedding: number[], limit = 5) {
    const vector = `[${embedding.join(',')}]`;

    return this.prisma.$queryRawUnsafe(
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
  }
}
