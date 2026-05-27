// apps/backend/src/modules/media/presentation/media.controller.ts

import {
  Controller, Post, UploadedFile, UseInterceptors,
  Inject, BadRequestException, HttpCode, HttpStatus, Query, UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiTags, ApiConsumes, ApiBody, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IMediaService, MEDIA_SERVICE } from '../domain/media.service.interface';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { validateFileBuffer } from '../infrastructure/magic-byte.validator';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const uploadInterceptor = FileInterceptor('file', {
  storage: memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    // Katman 1: MIME type string kontrolü (hızlı ret)
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestException(
        `Desteklenmeyen format: ${file.mimetype}. İzin verilenler: JPEG, PNG, WebP`,
      ), false);
    }
  },
});

@ApiTags('Media')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('media')
export class MediaController {
  constructor(@Inject(MEDIA_SERVICE) private readonly mediaService: IMediaService) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Medya dosyası yükle' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' }, subPath: { type: 'string', example: 'products' } } } })
  @UseInterceptors(uploadInterceptor)
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('subPath') subPath = 'products',
  ) {
    if (!file) throw new BadRequestException('Dosya yüklenmedi (field name "file" olmalı)');

    // Katman 2: Magic byte — MIME type string atlatmasını engeller
    validateFileBuffer(file);

    const result = await this.mediaService.processAndUpload(file, { subPath });
    if (!result.success) throw new BadRequestException(result.error.message);
    return { success: true, data: result.data };
  }
}

// /upload alias — frontend 6 composable'da bu path'i kullanıyor
@ApiTags('Media')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(@Inject(MEDIA_SERVICE) private readonly mediaService: IMediaService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Dosya yükle — /media/upload tercih edilmeli' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(uploadInterceptor)
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('subPath') subPath = 'products',
  ) {
    if (!file) throw new BadRequestException('Dosya yüklenmedi');
    validateFileBuffer(file);
    const result = await this.mediaService.processAndUpload(file, { subPath });
    if (!result.success) throw new BadRequestException(result.error.message);
    return { success: true, data: result.data };
  }
}
