// apps/backend/src/modules/media/presentation/upload.controller.ts
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
import { extname } from 'path';
import { ApiTags, ApiConsumes, ApiBody, ApiOperation } from '@nestjs/swagger';
import { IMediaService, MEDIA_SERVICE } from '../domain/media.service.interface';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const TEMP_UPLOAD_DIR = './public/uploads/temp';

@ApiTags('Media')
@Controller('upload')
export class UploadController {
  constructor(
    @Inject(MEDIA_SERVICE)
    private readonly mediaService: IMediaService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Dosya yükleme (Standalone endpoint)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('image', {
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
    console.log('--- UPLOAD CALLED ---', { 
      hasFile: !!file, 
      filename: file?.originalname, 
      mimetype: file?.mimetype, 
      size: file?.size 
    });

    if (!file) {
      console.warn('⚠️ No file attached to upload request');
      throw new BadRequestException('Dosya yüklenmedi veya geçersiz format (Field name "image" olmalı)');
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
