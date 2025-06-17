import {
  Injectable,
  Logger
} from '@nestjs/common';
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

async registerGoat(data: any) {
  // 1. Create the goat first to get the generated ID
  const goat = await this.prisma.goat.create({
    data: {
      ...data,
    },
  });

  // 2. Use goat ID as barcode value
  const barcodeValue = goat.id;

  const barcodeBuffer = await bwipjs.toBuffer({
    bcid: 'code128',
    text: barcodeValue, // ID becomes the scannable value
    scale: 3,
    height: 10,
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
      text: `
Goat Registered:

- Name: ${goat.goatName}
- Barcode (Goat ID): ${goat.id}
- Breed: ${goat.breed}
- Sex: ${goat.Gender}

Barcode image is attached. Please print and tag the goat accordingly.
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

}
