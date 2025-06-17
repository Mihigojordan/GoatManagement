import {
  Controller,
  Post,
  Body,
  Get,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GoatService } from './goat.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('goats')
export class GoatController {
  constructor(private readonly goatService: GoatService) {}

  // Register a new goat with image upload
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/goats',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async registerGoat(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: any,
  ) {
    const imagePath = file ? file.path : null;

    const goat = await this.goatService.registerGoat({
      ...dto,
      image: imagePath,
    });

    return {
      message: 'Goat registered successfully.',
      data: goat,
    };
  }

  // Get all goats
  @Get()
  async getAllGoats() {
    return this.goatService.getAllGoats();
  }
}
