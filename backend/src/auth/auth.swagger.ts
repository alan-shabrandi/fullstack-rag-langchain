// src/auth/auth.swagger.ts
import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiAuthRegister() {
  return applyDecorators(
    ApiOperation({ summary: 'Register a new user' }),
    ApiResponse({ status: 201, description: 'User successfully registered' }),
    ApiResponse({ status: 400, description: 'Bad request' }),
  );
}

export function ApiAuthLogin() {
  return applyDecorators(
    ApiOperation({ summary: 'Login and get access token' }),
    ApiResponse({ status: 200, description: 'Login successful' }),
    ApiResponse({ status: 401, description: 'Invalid credentials' }),
  );
}
