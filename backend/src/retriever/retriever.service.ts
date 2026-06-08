import { Injectable } from '@nestjs/common';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { VectorSearchService } from '../vector/vector-search.service';

@Injectable()
export class RetrieverService {
  constructor(
    private readonly embeddingsService: EmbeddingsService,
    private readonly vectorSearchService: VectorSearchService,
  ) {}

  async retrieve(question: string, userId: string, topK = 5) {
    const queryEmbedding = await this.embeddingsService.embedQuery(question);

    return this.vectorSearchService.similaritySearch(
      queryEmbedding,
      userId,
      topK,
    );
  }
}
