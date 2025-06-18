import {
  Controller,
  Post,
  Body,
  Get,
  UseInterceptors,
  UploadedFile,
  Logger,
  Req,
  ParseIntPipe,
  Param
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GoatService } from './goat.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Request } from 'express';


@Controller('goats')
export class GoatController {
      private readonly logger = new Logger(GoatController.name);
  constructor(private readonly goatService: GoatService) {}

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
  console.log('📦 Raw body:', dto);
  console.log('📷 File:', file);

  const parsedGoatData = {
    goatName: dto.goatName,
    breed: dto.breed,
    dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
    Gender: dto.Gender,
    color: dto.color,
    weight: dto.weight ? Number(dto.weight) : null,
    sireName: dto.sireName,
    sireRegistrationNumber: dto.sireRegistrationNumber,
    damName: dto.damName,
    damRegistrationNumber: dto.damRegistrationNumber,
    image: file?.path || null,
  };

  const goat = await this.goatService.registerGoat(parsedGoatData);

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

    @Post('scan')
  async handleScan(@Body() body: { goatId: string }) {
    this.logger.log(`Scanned Goat ID: ${body.goatId}`);
    return this.goatService.toggleGoatStatus(body.goatId);
  }


@Get('counts')
async getGoatCounts() {
  return this.goatService.getGoatCounts();
}

@Get(':id')
async getGoatById(@Param('id') id: string) {
  console.log('Received ID:', id); // Log the ID
  const goat = await this.goatService.getGoatById(id);
  return goat;
}

  
}
