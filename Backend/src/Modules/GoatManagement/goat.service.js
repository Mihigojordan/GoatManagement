"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GoatService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../Prisma/prisma.service");
const Email_service_1 = require("./Email.service");
const bwipjs = __importStar(require("bwip-js"));
const fs = __importStar(require("fs"));
const path_1 = require("path");
const client_1 = require("@prisma/client");
let GoatService = GoatService_1 = class GoatService {
    prisma;
    emailService;
    logger = new common_1.Logger(GoatService_1.name);
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
    }
    // ✅ Helper method to generate a 12-digit base for EAN-13
    generateEAN13Base() {
        return Math.floor(100000000000 + Math.random() * 900000000000).toString();
    }
    // ✅ Helper method to calculate EAN-13 check digit
    calculateEAN13CheckDigit(base) {
        let sum = 0;
        for (let i = 0; i < 12; i++) {
            const digit = parseInt(base[i]);
            sum += i % 2 === 0 ? digit : digit * 3;
        }
        return ((10 - (sum % 10)) % 10).toString();
    }
    // ✅ Register goat and generate barcode
    async registerGoat(data) {
        if (data.dateOfBirth) {
            data.dateOfBirth = new Date(data.dateOfBirth);
        }
        if (data.weight) {
            data.weight = Number(data.weight);
        }
        // Generate unique 13-digit EAN ID
        let generatedId;
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
            scale: 2.5, // Small but clear
            height: 15,
            includetext: true,
            paddingwidth: 10,
            paddingheight: 10,
            textxalign: 'center',
            backgroundcolor: 'FFFFFF',
        });
        // ✅ Save barcode image
        const barcodeDir = (0, path_1.join)(__dirname, '../../../public/barcodes');
        if (!fs.existsSync(barcodeDir)) {
            fs.mkdirSync(barcodeDir, { recursive: true });
        }
        const fileName = `${barcodeValue}.png`;
        const barcodePath = (0, path_1.join)(barcodeDir, fileName);
        fs.writeFileSync(barcodePath, barcodeBuffer);
        // ✅ Email barcode
        try {
            await this.emailService.sendEmail({
                to: 'ishimwegoatfarm@gmail.com',
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
        }
        catch (error) {
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
    async toggleGoatStatus(goatId) {
        const goat = await this.prisma.goat.findUnique({ where: { id: goatId } });
        if (!goat) {
            throw new Error('Goat not found');
        }
        const newStatus = goat.status === client_1.Status.checkedin ? client_1.Status.checkout : client_1.Status.checkedin;
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
    async getGoatById(id) {
        return this.prisma.goat.findUnique({
            where: { id },
        });
    }
    // ✅ Get goat check-in status only
    async getGoatStatusById(id) {
        const goat = await this.prisma.goat.findUnique({
            where: { id },
        });
        if (!goat) {
            throw new common_1.NotFoundException(`Goat with ID ${id} not found`);
        }
        return {
            message: 'Goat data retrieved successfully',
            data: goat,
        };
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
};
exports.GoatService = GoatService;
exports.GoatService = GoatService = GoatService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        Email_service_1.EmailService])
], GoatService);
