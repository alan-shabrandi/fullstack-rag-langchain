/*
  Warnings:

  - You are about to drop the column `embedding` on the `DocumentChunk` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "document_chunk_embedding_idx";

-- AlterTable
ALTER TABLE "DocumentChunk" DROP COLUMN "embedding";
