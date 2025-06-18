import {
  Injectable,
  Logger
} from '@nestjs/common';
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

async registerGoat(data: any) {
  // 1. Create the goat first to get the generated ID
  // Convert dateOfBirth to Date object
  if (data.dateOfBirth) {
    data.dateOfBirth = new Date(data.dateOfBirth);
  }

  // Convert weight to number
  if (data.weight) {
    data.weight = Number(data.weight);
  }

  // Generate unique 7-character ID
function generate7DigitId() {
  return Math.floor(1000000 + Math.random() * 9000000).toString(); // Ensures a 7-digit number
}


  // Ensure uniqueness
// Ensure uniqueness
let generatedId: string;
do {
  generatedId = generate7DigitId();
} while (await this.prisma.goat.findUnique({ where: { id: generatedId } }));

  // Create the goat record
  const goat = await this.prisma.goat.create({
 data: {
  ...data,
  id: generatedId, // always override last to prevent accidental override
}
  });

  const barcodeValue = goat.id;


const barcodeBuffer = await bwipjs.toBuffer({
  bcid: 'ean8',              // Change from 'code128' to 'ean8'
  text: barcodeValue,        // barcodeValue must be a valid 7- or 8-digit number (EAN-8 requires numeric input)
  scale: 3,                  // Adjusted scale for better visibility
  height: 10,                // Height in mm (optional, adjust as needed)
  includetext: true,
  textxalign: 'center',
});


  // 3. Save barcode image
  const barcodeDir = join(__dirname, '../../../public/barcodes');
  if (!fs.existsSync(barcodeDir)) {
    fs.mkdirSync(barcodeDir, { recursive: true });
  }

  const fileName = `${barcodeValue}.png`;
  const barcodePath = join(barcodeDir, fileName);
  fs.writeFileSync(barcodePath, barcodeBuffer);

  // 4. Email barcode as attachment
  try {
    await this.emailService.sendEmail({
  to: 'Mihigojordan8@gmail.com',
  subject: '🐐 Goat Registered with Barcode (ID)',
  html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
      <h2 style="color: #2c3e50;">🐐 New Goat Registration</h2>
      <p style="font-size: 16px; color: #333;">
        The following goat has been successfully registered in the system:
      </p>
      <table style="width: 100%; max-width: 600px; border-collapse: collapse; margin-top: 20px;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ccc;"><strong>Name</strong></td>
          <td style="padding: 8px; border: 1px solid #ccc;">${goat.goatName}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ccc;"><strong>Breed</strong></td>
          <td style="padding: 8px; border: 1px solid #ccc;">${goat.breed}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ccc;"><strong>Gender</strong></td>
          <td style="padding: 8px; border: 1px solid #ccc;">${goat.Gender}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ccc;"><strong>Goat ID (Barcode)</strong></td>
          <td style="padding: 8px; border: 1px solid #ccc; color: #d35400;"><strong>${goat.id}</strong></td>
        </tr>
      </table>
      <p style="margin-top: 20px; font-size: 15px;">
        ✅ The barcode image is attached. Please print and tag the goat accordingly.
      </p>
      <p style="font-size: 14px; color: #888;">Sent on ${new Date().toLocaleString()}</p>
    </div>
  `,
  attachments: [
    {
      filename: `${fileName}`,
      content: fs.createReadStream(barcodePath),
      contentType: 'image/png',
    },
  ],
});

  } catch (error) {
    this.logger.error('Failed to send barcode email', error);
  }

  return {
    message: 'Goat registered and barcode emailed (based on ID).',
    data: goat,
  };
}

// Get all goats
  async getAllGoats() {
    return this.prisma.goat.findMany({ orderBy: { createdAt: 'desc' } });
  }

  // Toggle goat status based on ID
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

async getGoatById(id: string) {
  return this.prisma.goat.findUnique({
    where: { id },
  });
}

async getGoatCounts() {
  const [total, checkedin, checkout] = await Promise.all([
    this.prisma.goat.count(), // total goats
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
