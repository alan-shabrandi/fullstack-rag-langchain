import { Injectable } from '@nestjs/common';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { VectorSearchService } from '../vector/vector-search.service';

// تعریف اینترفیس برای ساختار داده بازگشتی از دیتابیس برداری
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
