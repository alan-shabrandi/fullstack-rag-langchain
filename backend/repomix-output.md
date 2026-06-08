This file is a merged representation of a subset of the codebase, containing specifically included files, combined into a single document by Repomix.
The content has been processed where comments have been removed, empty lines have been removed.

# File Summary

## Purpose

This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format

The content is organized as follows:

1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
   a. A header with the file path (## File: path/to/file)
   b. The full contents of the file in a code block

## Usage Guidelines

- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes

- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: package.json, src/llm/llm.service.ts, src/document/chunk.service.ts, src/document/pdf.service.ts, src/chat/chat.controller.ts
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Code comments have been removed from supported file types
- Empty lines have been removed from all files
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure

```
package.json
src/chat/chat.controller.ts
src/document/chunk.service.ts
src/document/pdf.service.ts
src/llm/llm.service.ts
```

# Files

## File: package.json

```json
{
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  },
  "dependencies": {
    "@google/generative-ai": "^0.24.1",
    "@langchain/core": "^1.1.48",
    "@langchain/google-genai": "^2.1.31",
    "@langchain/textsplitters": "^1.0.1",
    "@nestjs/bullmq": "^11.0.4",
    "@nestjs/common": "^11.0.1",
    "@nestjs/config": "^4.0.4",
    "@nestjs/core": "^11.0.1",
    "@nestjs/jwt": "^11.0.2",
    "@nestjs/passport": "^11.0.5",
    "@nestjs/platform-express": "^11.1.26",
    "@prisma/adapter-pg": "^7.8.0",
    "@prisma/client": "^7.8.0",
    "bcrypt": "^6.0.0",
    "bullmq": "^5.78.0",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.15.1",
    "ioredis": "^5.11.1",
    "langchain": "^1.4.4",
    "multer": "^2.1.1",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "pdf-parse": "^2.4.5",
    "pg": "^8.21.0",
    "prisma": "^7.8.0",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3.2.0",
    "@eslint/js": "^9.18.0",
    "@nestjs/cli": "^11.0.0",
    "@nestjs/schematics": "^11.0.0",
    "@nestjs/testing": "^11.0.1",
    "@types/bcrypt": "^6.0.0",
    "@types/express": "^5.0.0",
    "@types/jest": "^30.0.0",
    "@types/multer": "^2.1.0",
    "@types/node": "^24.13.1",
    "@types/passport-jwt": "^4.0.1",
    "@types/pdf-parse": "^1.1.5",
    "@types/supertest": "^7.0.0",
    "eslint": "^9.18.0",
    "eslint-config-prettier": "^10.0.1",
    "eslint-plugin-prettier": "^5.2.2",
    "globals": "^17.0.0",
    "jest": "^30.0.0",
    "prettier": "^3.4.2",
    "source-map-support": "^0.5.21",
    "supertest": "^7.0.0",
    "ts-jest": "^29.2.5",
    "ts-loader": "^9.5.2",
    "ts-node": "^10.9.2",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.7.3",
    "typescript-eslint": "^8.20.0"
  }
}
```

## File: src/chat/chat.controller.ts

```typescript
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
@Controller('chat')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('USER', 'ADMIN')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}
  @Post('send')
  async sendMessage(
    @Body() dto: SendMessageDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.chatService.sendMessage(user.userId, dto.message, dto.chatId);
  }
  @Get()
  async getChats(@CurrentUser() user: { userId: string }) {
    return this.chatService.getChats(user.userId);
  }
  @Get(':chatId/messages')
  async getMessages(
    @Param('chatId') chatId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.chatService.getMessages(chatId, user.userId);
  }
}
```

## File: src/document/chunk.service.ts

```typescript
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
```

## File: src/document/pdf.service.ts

```typescript
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as pdfParse from 'pdf-parse';
@Injectable()
export class PdfService {
  async extractText(filePath: string): Promise<string> {
    const buffer = fs.readFileSync(filePath);
    const result = await (pdfParse as any)(buffer);
    return result.text;
  }
}
```

## File: src/llm/llm.service.ts

```typescript
import { Injectable } from '@nestjs/common';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
@Injectable()
export class LlmService {
  private readonly model: ChatGoogleGenerativeAI;
  constructor() {
    this.model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY!,
      model: 'gemini-2.0-flash',
      temperature: 0.7,
    });
  }
  async generateChatResponse(messages: { role: string; content: string }[]) {
    const history = messages.map((msg) => {
      return msg.role === 'USER'
        ? new HumanMessage(msg.content)
        : new AIMessage(msg.content);
    });
    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        'You are a helpful AI assistant. Answer clearly and accurately.',
      ],
      new MessagesPlaceholder('history'),
    ]);
    const chain = prompt.pipe(this.model);
    const result = await chain.invoke({ history });
    if (typeof result.content === 'string') {
      return result.content;
    }
    if (Array.isArray(result.content)) {
      return result.content
        .filter((part) => 'text' in part)
        .map((part) => (part as any).text)
        .join('');
    }
    return String(result.content);
  }
}
```
