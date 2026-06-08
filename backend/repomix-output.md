This file is a merged representation of a subset of the codebase, containing specifically included files, combined into a single document by Repomix.

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
- Only files matching these patterns are included: prisma/schema.prisma, src/auth/jwt.strategy.ts, src/auth/decorators/current-user.decorator.ts, src/prisma/prisma.service.ts, src/ai/ai.service.ts, src/ai/ai.controller.ts, src/llm/llm.service.ts
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
prisma/schema.prisma
src/ai/ai.controller.ts
src/ai/ai.service.ts
src/auth/decorators/current-user.decorator.ts
src/auth/jwt.strategy.ts
src/llm/llm.service.ts
src/prisma/prisma.service.ts
```

# Files

## File: prisma/schema.prisma
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  chats     Chat[]
}

model Chat {
  id        String    @id @default(uuid())
  userId    String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  user      User      @relation(fields: [userId], references: [id])
  messages  Message[]
}

model Message {
  id        String     @id @default(uuid())
  chatId    String
  role      RoleInChat
  content   String
  createdAt DateTime   @default(now())
  chat      Chat       @relation(fields: [chatId], references: [id])
}

enum Role {
  USER
  ADMIN
}

enum RoleInChat {
  USER
  ASSISTANT
}
```

## File: src/ai/ai.controller.ts
```typescript
import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { AiService } from './ai.service';
import { ChatDto } from './dto/chat.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { RolesGuard } from '../auth/guards/roles.guard';

import { Roles } from '../auth/decorators/roles.decorator';

import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER', 'ADMIN')
  async chat(
    @Body() dto: ChatDto,

    @CurrentUser()
    user: {
      userId: string;
      role: string;
    },
  ) {
    const response = await this.aiService.chat(dto.message, user.userId);

    return {
      success: true,
      response,
    };
  }
}
```

## File: src/ai/ai.service.ts
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LlmService } from '../llm/llm.service';

@Injectable()
export class AiService {
  constructor(
    private readonly llmService: LlmService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * پیام کاربر را دریافت کرده، ذخیره می‌کند و پاسخ LLM را بازمی‌گرداند
   * @param message پیام کاربر
   * @param userId آی‌دی کاربر
   */
  async chat(message: string, userId: string) {
    // 1️⃣ ذخیره پیام کاربر
    const userMessage = await this.prisma.chat.create({
      data: {
        content: message,
        role: 'USER',
        userId,
      },
    });

    // 2️⃣ دریافت پاسخ از LLM
    const responseText = await this.llmService.generateResponse(message);

    // 3️⃣ ذخیره پاسخ LLM
    await this.prisma.chat.create({
      data: {
        content: responseText,
        role: 'ASSISTANT',
        userId,
      },
    });

    return responseText;
  }
}
```

## File: src/auth/decorators/current-user.decorator.ts
```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    return request.user;
  },
);
```

## File: src/auth/jwt.strategy.ts
```typescript
import { Injectable } from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      ignoreExpiration: false,

      secretOrKey: process.env.JWT_SECRET ?? 'super-secret-key',
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      role: payload.role,
    };
  }
}
```

## File: src/llm/llm.service.ts
```typescript
import { Injectable } from '@nestjs/common';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

@Injectable()
export class LlmService {
  private readonly model: ChatGoogleGenerativeAI;

  constructor() {
    this.model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY!,
      model: 'gemini-2.5-flash',
      temperature: 0.7,
    });
  }

  async generateResponse(prompt: string) {
    const result = await this.model.invoke(prompt);

    return result.content;
  }
}
```

## File: src/prisma/prisma.service.ts
```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```
