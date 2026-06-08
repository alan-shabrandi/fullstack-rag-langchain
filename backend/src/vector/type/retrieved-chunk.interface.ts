export interface RetrievedChunk {
  id: string;
  documentId: string;
  content: string;
  chunkIndex: number;
  score: number;
}
