import {
  Controller,
  Post,
  Req,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { FastifyFileInterceptor } from './interceptor/fastify-file-interceptor';
import { FastifyFilesInterceptor } from './interceptor/fastify-files-interceptor';
import { fileMapper, filesMapper } from './utils/file-mapper';

@Controller('upload')
@ApiTags('Upload File ')
export class UploadController {
  @ApiConsumes('multipart/form-data')
  @Post('single')
  @UseInterceptors(FastifyFileInterceptor())
  single(
    @Req() req: FastifyRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return { ...fileMapper({ file, req }) };
  }

  @ApiConsumes('multipart/form-data')
  @Post('multiple')
  @UseInterceptors(FastifyFilesInterceptor())
  multiple(
    @Req() req: FastifyRequest,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return [...filesMapper({ files, req })];
  }
}
