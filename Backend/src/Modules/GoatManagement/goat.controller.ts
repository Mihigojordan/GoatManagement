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
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GoatService } from './goat.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { RequestWithAdmin } from 'src/common/interfaces/request-admin.interface';
import { AdminAuthGuard } from 'src/Guards/AdminAuth.guard';

@Controller('goats')
export class GoatController {
  private readonly logger = new Logger(GoatController.name);

  constructor(private readonly goatService: GoatService) {}

  // ✅ Register Goat with Image Upload
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/goats',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          let ext = extname(file.originalname);
          if (!ext) ext = '.jpg';
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async registerGoat(@UploadedFile() file: Express.Multer.File, @Body() dto: any) {
    this.logger.log('📦 Registering new goat', dto);

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
    return { message: 'Goat registered successfully.', data: goat };
  }

  // ✅ Get All Goats
  @Get()
  async getAllGoats() {
    return this.goatService.getAllGoats();
  }

  // ✅ Scan (Check-In)
  @UseGuards(AdminAuthGuard)
  @Post('scan')
  async handleScan(@Body() body: { goatId: string }, @Req() req: RequestWithAdmin) {
const adminId = req.admin!.id; // the "!" tells TS it’s definitely defined
this.logger.log(`📥 Check-In: Goat ${body.goatId} by Admin ${adminId}`);
return this.goatService.checkInGoat(body.goatId, adminId);
  }

  // ✅ Scan Out (Check-Out)
  @UseGuards(AdminAuthGuard)
  @Post('scan-out')
  async handleScanOut(@Body() body: { goatId: string }, @Req() req: RequestWithAdmin) {
const adminId = req.admin?.id;
if (!adminId) {
  throw new Error('Admin ID is required.');
}
return this.goatService.checkInGoat(body.goatId, adminId);
  }

  // ✅ Bulk Check-In
  @UseGuards(AdminAuthGuard)
  @Post('checkin-all')
  async handleCheckInAll(@Req() req: RequestWithAdmin) {
    const adminId = req.admin?.id;
    if (!adminId) throw new Error('Admin authentication required.');
    this.logger.log(`⚙️ Bulk check-in by Admin ${adminId}`);
    return this.goatService.checkInAllGoats(adminId);
  }

  // ✅ Bulk Check-Out
  @UseGuards(AdminAuthGuard)
  @Post('checkout-all')
  async handleCheckOutAll(@Req() req: RequestWithAdmin) {
    const adminId = req.admin?.id;
    if (!adminId) throw new Error('Admin authentication required.');
    this.logger.log(`⚙️ Bulk check-out by Admin ${adminId}`);
    return this.goatService.checkOutAllGoats(adminId);
  }

  // ✅ Goat Counts
  @Get('counts')
  async getGoatCounts() {
    return this.goatService.getGoatCounts();
  }

  // ✅ Goat Tracking History (All Check-Ins & Check-Outs)
  @Get('tracking')
  async getTrackingHistory() {
    return this.goatService.getTrackingHistory();
  }

  // ✅ Get Single Goat by ID
  @Get(':id')
  async getGoatById(@Param('id') id: string) {
    this.logger.log(`Fetching goat with ID: ${id}`);
    return this.goatService.getGoatById(id);
  }


}
