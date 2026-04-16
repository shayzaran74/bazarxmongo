// apps/backend/src/modules/media/presentation/media.controller.ts
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Inject,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { ApiTags, ApiConsumes, ApiBody, ApiOperation } from '@nestjs/swagger';
import { IMediaService, MEDIA_SERVICE } from '../domain/media.service.interface';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const TEMP_UPLOAD_DIR = './public/uploads/temp';

// Temp klasörünün varlığından emin olalım
if (!existsSync(TEMP_UPLOAD_DIR)) {
  mkdirSync(TEMP_UPLOAD_DIR, { recursive: true });
}

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(
    @Inject(MEDIA_SERVICE)
    private readonly mediaService: IMediaService,
  ) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Yeni bir medya dosyası yükler (DiskStorage - Bellek Dostu)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        subPath: { type: 'string', example: 'products' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: TEMP_UPLOAD_DIR,
        filename: (_req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              `Desteklenmeyen format: ${file.mimetype}. İzin verilenler: JPEG, PNG, WebP`,
            ),
            false,
          );
        }
      },
    }),
  )
  async upload(
    @UploadedFile() file: any,
    @Query('subPath') subPath: string = 'products',
  ) {
    if (!file) {
      throw new BadRequestException('Dosya yüklenmedi veya geçersiz format');
    }

    const result = await this.mediaService.processAndUpload(file, { subPath });

    if (!result.success) {
      throw new BadRequestException(result.error.message);
    }

    return {
      success: true,
      data: result.data,
    };
  }
}
