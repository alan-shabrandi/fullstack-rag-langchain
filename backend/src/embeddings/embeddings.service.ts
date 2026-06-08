import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class EmbeddingsService {
  private readonly genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

  async embed(text: string): Promise<number[]> {
    const model = this.genAI.getGenerativeModel({
      model: 'text-embedding-004',
    });

    const result = await model.embedContent(text);

    return result.embedding.values;
  }

  async embedQuery(query: string): Promise<number[]> {
    return this.embed(query);
  }
}
