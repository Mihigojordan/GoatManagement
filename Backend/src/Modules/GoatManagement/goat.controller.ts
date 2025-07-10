import {
  Controller,
  Post,
  Body,
  Get,
  UseInterceptors,
  UploadedFile,
  Logger,

  Param,
  Req,
  UseGuards
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GoatService } from './goat.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Request } from 'express';
import { RequestWithAdmin } from 'src/common/interfaces/request-admin.interface';
import { AdminAuthGuard } from 'src/Guards/AdminAuth.guard';


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

  let ext = extname(file.originalname);

  // If no extension, fallback to .jpg
  if (!ext) {
    ext = '.jpg';
  }

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

  @UseGuards(AdminAuthGuard)
  @Post('scan')
  async handleScan(
    @Body() body: { goatId: string },
    @Req() req: RequestWithAdmin
  ) {
    const adminId = req.admin?.id;
    this.logger.log(`Scanned Goat ID: ${body.goatId} by Admin ID: ${adminId}`);

    return this.goatService.checkInGoat(body.goatId, adminId);
  }


  
  @UseGuards(AdminAuthGuard)
  @Post('scan-out')
  async handleScanout(
    @Body() body: { goatId: string },
    @Req() req: RequestWithAdmin
  ) {
    const adminId = req.admin?.id;
    this.logger.log(`Scanned Goat ID: ${body.goatId} by Admin ID: ${adminId}`);

    return this.goatService.checkOutGoat(body.goatId, adminId);
  }







  @UseGuards(AdminAuthGuard)
  @Post('checkin-all')
  async handleCheckInAll(@Req() req: RequestWithAdmin) {
    const adminId = req.admin?.id;
    if (!adminId) {
      // Should never happen because guard rejects unauthenticated requests
      this.logger.error(`No admin ID found in request.`);
      throw new Error('Admin authentication required.');
    }

    this.logger.log(`Admin ${adminId} requested bulk check‑in`);

    const result = await this.goatService.checkInAllGoats(adminId);

    this.logger.log(`Checked in ${result.checkIns.length} goats`);
    return result;
  }

@UseGuards(AdminAuthGuard)
@Post('checkout-all')
async handleCheckOutAll(@Req() req: RequestWithAdmin) {
  const adminId = req.admin?.id;
  if (!adminId) {
    // Should never happen because guard rejects unauthenticated requests
    this.logger.error(`No admin ID found in request.`);
    throw new Error('Admin authentication required.');
  }

  this.logger.log(`Admin ${adminId} requested bulk check‑out`);

  const result = await this.goatService.checkOutAllGoats(adminId);

  this.logger.log(`Checked out ${result.checkOuts.length} goats`);
  return result;
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



  // Inside your GoatController
@Get('status/:id')
async getGoatStatus(@Param('id') id: string) {
  return this.goatService.getGoatStatusById(id);
}
 
}
 