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
    // حالا chunks به درستی تایپ شده است
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
