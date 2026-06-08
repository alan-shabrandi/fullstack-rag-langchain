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
