import { Module } from '@nestjs/common';
import { RagService } from './rag.service';
import { RetrieverModule } from '../retriever/retriever.module';
import { LlmModule } from '../llm/llm.module';

@Module({
  imports: [RetrieverModule, LlmModule],
  providers: [RagService],
  exports: [RagService],
})
export class RagModule {}
