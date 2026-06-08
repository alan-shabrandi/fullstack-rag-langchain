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
