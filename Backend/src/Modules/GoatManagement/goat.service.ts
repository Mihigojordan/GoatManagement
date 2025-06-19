import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../Prisma/prisma.service';
import { EmailService } from './Email.service';
import * as bwipjs from 'bwip-js';
import * as fs from 'fs';
import { join } from 'path';
import { Status } from '@prisma/client';

@Injectable()
export class GoatService {
  private readonly logger = new Logger(GoatService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  // ✅ Helper method to generate a 12-digit base for EAN-13
  private generateEAN13Base(): string {
    return Math.floor(100000000000 + Math.random() * 900000000000).toString();
  }

  // ✅ Helper method to calculate EAN-13 check digit
  private calculateEAN13CheckDigit(base: string): string {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(base[i]);
      sum += i % 2 === 0 ? digit : digit * 3;
    }
    return ((10 - (sum % 10)) % 10).toString();
  }

  // ✅ Register goat and generate barcode
  async registerGoat(data: any) {
    if (data.dateOfBirth) {
      data.dateOfBirth = new Date(data.dateOfBirth);
    }

    if (data.weight) {
      data.weight = Number(data.weight);
    }

    // Generate unique 13-digit EAN ID
    let generatedId: string;
    do {
      const base = this.generateEAN13Base();
      const checkDigit = this.calculateEAN13CheckDigit(base);
      generatedId = base + checkDigit;
    } while (await this.prisma.goat.findUnique({ where: { id: generatedId } }));

    // Create the goat
    const goat = await this.prisma.goat.create({
      data: {
        ...data,
        id: generatedId,
      },
    });

    const barcodeValue = goat.id;

    // ✅ Generate barcode image
    const barcodeBuffer = await bwipjs.toBuffer({
      bcid: 'ean13',
      text: barcodeValue,
      scale: 2.5,                // Small but clear
      height: 15,
      includetext: true,
      paddingwidth: 10,
      paddingheight: 10,
      textxalign: 'center',
      backgroundcolor: 'FFFFFF',
    });

    // ✅ Save barcode image
    const barcodeDir = join(__dirname, '../../../public/barcodes');
    if (!fs.existsSync(barcodeDir)) {
      fs.mkdirSync(barcodeDir, { recursive: true });
    }

    const fileName = `${barcodeValue}.png`;
    const barcodePath = join(barcodeDir, fileName);
    fs.writeFileSync(barcodePath, barcodeBuffer);

    // ✅ Email barcode
    try {
      await this.emailService.sendEmail({
        to: 'Mihigojordan8@gmail.com',
        subject: '🐐 Goat Registered with Barcode (ID)',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
            <h2 style="color: #2c3e50;">🐐 New Goat Registration</h2>
            <table style="width: 100%; max-width: 600px; border-collapse: collapse; margin-top: 20px;">
              <tr><td><strong>Name</strong></td><td>${goat.goatName}</td></tr>
              <tr><td><strong>Breed</strong></td><td>${goat.breed}</td></tr>
              <tr><td><strong>Gender</strong></td><td>${goat.Gender}</td></tr>
              <tr><td><strong>Goat ID (Barcode)</strong></td><td><strong>${goat.id}</strong></td></tr>
            </table>
            <p style="margin-top: 20px;">✅ Barcode attached. Please print and tag the goat.</p>
            <p style="font-size: 12px; color: #888;">Sent on ${new Date().toLocaleString()}</p>
          </div>
        `,
        attachments: [
          {
            filename: fileName,
            content: fs.createReadStream(barcodePath),
            contentType: 'image/png',
          },
        ],
      });
    } catch (error) {
      this.logger.error('❌ Failed to send barcode email', error);
    }

    return {
      message: 'Goat registered and barcode emailed (EAN-13 format).',
      data: goat,
    };
  }

  // ✅ Get all goats
  async getAllGoats() {
    return this.prisma.goat.findMany({ orderBy: { createdAt: 'desc' } });
  }

  // ✅ Toggle goat check-in/check-out status
  async toggleGoatStatus(goatId: string) {
    const goat = await this.prisma.goat.findUnique({ where: { id: goatId } });

    if (!goat) {
      throw new Error('Goat not found');
    }

    const newStatus = goat.status === Status.checkedin ? Status.checkout : Status.checkedin;

    await this.prisma.goat.update({
      where: { id: goatId },
      data: { status: newStatus },
    });

    return {
      message: `Goat ${goatId} status updated to ${newStatus}`,
      status: newStatus,
    };
  }

  // ✅ Get single goat by ID
  async getGoatById(id: string) {
    return this.prisma.goat.findUnique({
      where: { id },
    });
  }

  // ✅ Get goat count stats
  async getGoatCounts() {
    const [total, checkedin, checkout] = await Promise.all([
      this.prisma.goat.count(),
      this.prisma.goat.count({ where: { status: 'checkedin' } }),
      this.prisma.goat.count({ where: { status: 'checkout' } }),
    ]);

    return {
      totalGoats: total,
      checkedInGoats: checkedin,
      checkedOutGoats: checkout,
    };
  }
}
