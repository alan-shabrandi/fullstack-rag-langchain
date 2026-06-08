import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('AI Chat & RAG Platform API')
    .setDescription(
      'Production-ready AI Chat Application with RAG capabilities',
    )
    .setVersion('1.0.0')
    .addTag('Auth')
    .addTag('Chat')
    .addTag('Documents')
    .addTag('RAG')
    .addTag('Health')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste JWT token here',
      },
      'JWT',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'AI Chat & RAG Docs',
  });
}
