"use strict";
// import { Injectable, NotFoundException } from '@nestjs/common';
// import { PrismaService } from '../../Prisma/prisma.service';
// @Injectable()
// export class CheckoutService {
//   constructor(private readonly prisma: PrismaService) {}
//   async createCheckout(barcodeNumber: string) {
//     // Find goat by barcode number
//     const goat = await this.prisma.goat.findUnique({
//       where: { barcodeNumber },
//     });
//     if (!goat) {
//       throw new NotFoundException('Goat not found with this barcode');
//     }
//     // Create checkout entry
//     const checkout = await this.prisma.checkout.create({
//       data: {
//         goatId: goat.id,
//         checkedOutAt: new Date(),
//       },
//     });
//     return checkout;
//   }
// }
