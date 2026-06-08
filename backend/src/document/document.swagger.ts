import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

export function ApiDocumentTags() {
  return applyDecorators(ApiTags('Documents'), ApiBearerAuth('JWT'));
}

export function ApiUploadDocument() {
  return applyDecorators(
    ApiOperation({ summary: 'Upload a new document' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    }),
    ApiResponse({ status: 201, description: 'File uploaded successfully' }),
  );
}

export function ApiGetDocuments() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all user documents' }),
    ApiResponse({ status: 200, description: 'List of documents retrieved' }),
  );
}

export function ApiGetDocumentById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get a specific document by ID' }),
    ApiParam({ name: 'id', description: 'The ID of the document' }),
    ApiResponse({ status: 200, description: 'Document details retrieved' }),
  );
}

export function ApiDeleteDocument() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a document by ID' }),
    ApiParam({ name: 'id', description: 'The ID of the document' }),
    ApiResponse({ status: 200, description: 'Document deleted successfully' }),
  );
}
