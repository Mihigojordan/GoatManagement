// import {
//   Controller,
//   Post,
//   Body,
//   Get,
//   Param,
//   ParseIntPipe,
//   Put,
//   Delete,
//   NotFoundException,
// } from '@nestjs/common';
// import { GoatService } from './goat.service';

// @Controller('goats')
// export class GoatController {
//   constructor(private readonly goatService: GoatService) {}

//   // Register a new goat
//   @Post()
//   async registerGoat(@Body() dto: any) {
//     const goat = await this.goatService.registerGoat(dto);
//     return {
//       message: 'Goat registered successfully.',
//       data: goat,
//     };
//   }

//   // Get all goats
//   @Get()
//   async getAllGoats() {
//     return this.goatService.getAllGoats();
//   }
//   @Get('barcode/:barcodeNumber')
//   async getGoatByBarcode(@Param('barcodeNumber') barcodeNumber: string) {
//     const goat = await this.goatService.findByBarcode(barcodeNumber);
//     if (!goat) throw new NotFoundException('No goat found for this barcode');
//     return goat;
//   }


//   // Update goat by ID
//   @Put(':id')
//   async updateGoat(
//     @Param('id', ParseIntPipe) id: string,
//     @Body() dto: any,
//   ) {
//     const updated = await this.goatService.updateGoat(id, dto);
//     return {
//       message: 'Goat updated successfully.',
//       data: updated,
//     };
//   }

//   // Delete goat by ID
//   @Delete(':id')
//   async deleteGoat(@Param('id', ParseIntPipe) id: string) {
//     await this.goatService.deleteGoat(id);
//     return { message: 'Goat deleted successfully.' };
//   }

//   // Get single goat by ID
//   @Get(':id')
//   async getGoatById(@Param('id', ParseIntPipe) id: string) {
//     const goat = await this.goatService.getGoatById(id);
//     return goat;
//   }
// }
