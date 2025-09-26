import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../Prisma/prisma.service';
import { EmailService } from './Email.service';
import * as bwipjs from 'bwip-js';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class GoatService {
  private readonly logger = new Logger(GoatService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  // ✅ Generate 12-digit base for EAN-13 barcode
  private generateEAN13Base(): string {
    return Math.floor(100000000000 + Math.random() * 900000000000).toString();
  }

  // ✅ Calculate EAN-13 check digit
  private calculateEAN13CheckDigit(base: string): string {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(base[i]);
      sum += i % 2 === 0 ? digit : digit * 3;
    }
    return ((10 - (sum % 10)) % 10).toString();
  }

  // ✅ Register a goat with barcode + email
  async registerGoat(data: any) {
    if (data.dateOfBirth) data.dateOfBirth = new Date(data.dateOfBirth);
    if (data.weight) data.weight = Number(data.weight);

    // Generate unique 13-digit ID
    let generatedId: string;
    do {
      const base = this.generateEAN13Base();
      const checkDigit = this.calculateEAN13CheckDigit(base);
      generatedId = base + checkDigit;
    } while (await this.prisma.goat.findUnique({ where: { id: generatedId } }));

    const goat = await this.prisma.goat.create({
      data: { ...data, id: generatedId },
    });

    // ✅ Generate barcode
    const barcodeValue = goat.id;
    const barcodeBuffer = await bwipjs.toBuffer({
      bcid: 'ean13',
      text: barcodeValue,
      scale: 2.5,
      height: 15,
      includetext: true,
      textxalign: 'center',
      backgroundcolor: 'FFFFFF',
    });

    // ✅ Save barcode image
    const barcodeDir = join(__dirname, '../../../public/barcodes');
    if (!fs.existsSync(barcodeDir)) fs.mkdirSync(barcodeDir, { recursive: true });

    const fileName = `${barcodeValue}.png`;
    const barcodePath = join(barcodeDir, fileName);
    fs.writeFileSync(barcodePath, barcodeBuffer);

    // ✅ Send email
    try {
      await this.emailService.sendEmail({
        to: 'ishimwegoatfarm@gmail.com',
        subject: '🐐 Goat Registered with Barcode',
        html: `
          <h2>🐐 New Goat Registration</h2>
          <p><strong>Name:</strong> ${goat.goatName}</p>
          <p><strong>Breed:</strong> ${goat.breed}</p>
          <p><strong>Gender:</strong> ${goat.Gender}</p>
          <p><strong>ID:</strong> ${goat.id}</p>
          <p>✅ Barcode attached.</p>
        `,
        attachments: [
          {
            filename: fileName,
            content: fs.createReadStream(barcodePath),
            contentType: 'image/png',
          },
        ],
      });
    } catch (err) {
      this.logger.error('Failed to send barcode email', err);
    }

    return {
      message: 'Goat registered successfully.',
      goat,
    };
  }

  // ✅ Get all goats
  async getAllGoats() {
    return this.prisma.goat.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // ✅ Check in goat
  async checkInGoat(goatId: string, adminId: string) {
    if (!adminId) throw new Error('Admin ID required');

    const goat = await this.prisma.goat.findUnique({ where: { id: goatId } });
    if (!goat) throw new NotFoundException('Goat not found');

    // Ensure goat is currently checked out
    const checkOutRecord = await this.prisma.checkOut.findFirst({ where: { goatId } });
    if (!checkOutRecord) throw new Error('This goat is not currently checked out');

    // Remove checkout
    await this.prisma.checkOut.deleteMany({ where: { goatId } });

    // Create checkin
    const checkIn = await this.prisma.checkIn.create({
      data: { goatId, adminId },
    });

    return {
      message: `Goat ${goat.goatName} checked in successfully`,
      checkIn,
    };
  }

  // ✅ Check out goat
  async checkOutGoat(goatId: string, adminId: string) {
    if (!adminId) throw new Error('Admin ID required');

    const goat = await this.prisma.goat.findUnique({ where: { id: goatId } });
    if (!goat) throw new NotFoundException('Goat not found');

    // Ensure goat is currently checked in
    const checkInRecord = await this.prisma.checkIn.findFirst({ where: { goatId } });
    if (!checkInRecord) throw new Error('This goat is not currently checked in');

    // Remove checkin
    await this.prisma.checkIn.deleteMany({ where: { goatId } });

    // Create checkout
    const checkOut = await this.prisma.checkOut.create({
      data: { goatId, adminId },
    });

    return {
      message: `Goat ${goat.goatName} checked out successfully`,
      checkOut,
    };
  }

  // ✅ Check in all goats
  async checkInAllGoats(adminId: string) {
    const goats = await this.prisma.goat.findMany();
    if (goats.length === 0) throw new Error('No goats found');

    const checkIns = await Promise.all(
      goats.map(async (goat) =>
        this.prisma.checkIn.create({ data: { goatId: goat.id, adminId } }),
      ),
    );

    return {
      message: `${checkIns.length} goats checked in successfully`,
      count: checkIns.length,
    };
  }

  // ✅ Check out all goats
  async checkOutAllGoats(adminId: string) {
    const checkIns = await this.prisma.checkIn.findMany();
    if (checkIns.length === 0) throw new Error('No goats are checked in');

    const checkOuts = await Promise.all(
      checkIns.map(async (record) => {
        await this.prisma.checkIn.delete({ where: { id: record.id } });
        return this.prisma.checkOut.create({
          data: { goatId: record.goatId, adminId },
        });
      }),
    );

    return {
      message: `${checkOuts.length} goats checked out successfully`,
      count: checkOuts.length,
    };
  }

  // ✅ Get goat by ID
  async getGoatById(id: string) {
    const goat = await this.prisma.goat.findUnique({
      where: { id },
      include: {
        checkIns: {
          include: { admin: { select: { names: true, email: true } } },
          orderBy: { date: 'desc' },
        },
        checkOuts: {
          include: { admin: { select: { names: true, email: true } } },
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!goat) throw new NotFoundException(`Goat with ID ${id} not found`);

    return {
      message: 'Goat retrieved successfully',
      data: goat,
    };
  }

  // ✅ Get goat status summary
  async getGoatCounts() {
    const total = await this.prisma.goat.count();
    const checkedIn = await this.prisma.checkIn.count();
    const checkedOut = await this.prisma.checkOut.count();

    return {
      totalGoats: total,
      checkedInGoats: checkedIn,
      checkedOutGoats: checkedOut,
    };
  }

  // ✅ Get full history (all check-ins and check-outs)
  async getTrackingHistory() {
    const checkIns = await this.prisma.checkIn.findMany({
      include: { goat: true, admin: true },
      orderBy: { date: 'desc' },
    });
    const checkOuts = await this.prisma.checkOut.findMany({
      include: { goat: true, admin: true },
      orderBy: { date: 'desc' },
    });

    return { checkIns, checkOuts };
  }
}
