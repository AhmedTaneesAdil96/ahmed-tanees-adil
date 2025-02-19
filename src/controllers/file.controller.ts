import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FileService } from '../services/file.service';
import { Endpoints } from '../../lib';

@Controller('file')
export class FileController {
  private readonly logger = new Logger(FileController.name);

  constructor(private readonly fileService: FileService) {}

  @Get(Endpoints.generate)
  async generateFile(): Promise<{
    statusCode: number;
    message: string;
    filePath?: string;
  }> {
    try {
      this.logger.log('Generating file...');
      const filePath = await this.fileService.generateFile();
      this.logger.log(`File successfully generated at: ${filePath}`);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'File generated successfully',
        filePath,
      };
    } catch (error) {
      this.logger.error('Error generating file:', error);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'File generation failed',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(Endpoints.process)
  async processFile(): Promise<{
    statusCode: number;
    message: string;
    outputPath?: string;
  }> {
    try {
      this.logger.log('Processing file...');
      const result = await this.fileService.processFile();
      this.logger.log(
        `Processing complete. Output saved at: ${result.outputPath}`,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'File processed successfully',
        outputPath: result.outputPath,
      };
    } catch (error) {
      this.logger.error('Error processing file:', error);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'File processing failed',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
