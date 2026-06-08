import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  ApiDocumentTags,
  ApiUploadDocument,
  ApiGetDocuments,
  ApiGetDocumentById,
  ApiDeleteDocument,
} from './document.swagger';

@ApiDocumentTags()
@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('USER', 'ADMIN')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiUploadDocument()
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { userId: string },
  ) {
    const doc = await this.documentService.uploadFile(user.userId, file);
    return { success: true, document: doc };
  }

  @Get()
  @ApiGetDocuments()
  async getDocuments(@CurrentUser() user: { userId: string }) {
    const docs = await this.documentService.getDocuments(user.userId);
    return { success: true, documents: docs };
  }

  @Get(':id')
  @ApiGetDocumentById()
  async getDocument(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    const doc = await this.documentService.getDocument(user.userId, id);
    return { success: true, document: doc };
  }

  @Delete(':id')
  @ApiDeleteDocument()
  async deleteDocument(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    const doc = await this.documentService.deleteDocument(user.userId, id);
    return { success: true, document: doc };
  }
}
