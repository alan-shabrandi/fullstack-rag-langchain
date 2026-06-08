import { Module } from '@nestjs/common';
import { VectorSearchService } from './vector-search.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [PrismaService, VectorSearchService],
  exports: [VectorSearchService],
})
export class VectorModule {}
