import { Injectable } from '@nestjs/common';

import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

@Injectable()
export class ChunkService {
  private splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  async split(text: string) {
    return this.splitter.splitText(text);
  }
}
