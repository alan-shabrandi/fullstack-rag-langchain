CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE "DocumentChunk"
DROP COLUMN IF EXISTS embedding;

ALTER TABLE "DocumentChunk"
ADD COLUMN embedding vector(768);

CREATE INDEX document_chunk_embedding_idx
ON "DocumentChunk"
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);