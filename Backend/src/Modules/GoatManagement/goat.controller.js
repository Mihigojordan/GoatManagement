"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var GoatController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoatController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const goat_service_1 = require("./goat.service");
const multer_1 = require("multer");
const path_1 = require("path");
let GoatController = GoatController_1 = class GoatController {
    goatService;
    logger = new common_1.Logger(GoatController_1.name);
    constructor(goatService) {
        this.goatService = goatService;
    }
    async registerGoat(file, dto) {
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
    async getAllGoats() {
        return this.goatService.getAllGoats();
    }
    async handleScan(body) {
        this.logger.log(`Scanned Goat ID: ${body.goatId}`);
        return this.goatService.toggleGoatStatus(body.goatId);
    }
    async getGoatCounts() {
        return this.goatService.getGoatCounts();
    }
    async getGoatById(id) {
        console.log('Received ID:', id); // Log the ID
        const goat = await this.goatService.getGoatById(id);
        return goat;
    }
    // Inside your GoatController
    async getGoatStatus(id) {
        return this.goatService.getGoatStatusById(id);
    }
};
exports.GoatController = GoatController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/goats',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                let ext = (0, path_1.extname)(file.originalname);
                // If no extension, fallback to .jpg
                if (!ext) {
                    ext = '.jpg';
                }
                cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
            },
        }),
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GoatController.prototype, "registerGoat", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GoatController.prototype, "getAllGoats", null);
__decorate([
    (0, common_1.Post)('scan'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GoatController.prototype, "handleScan", null);
__decorate([
    (0, common_1.Get)('counts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GoatController.prototype, "getGoatCounts", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GoatController.prototype, "getGoatById", null);
__decorate([
    (0, common_1.Get)('status/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GoatController.prototype, "getGoatStatus", null);
exports.GoatController = GoatController = GoatController_1 = __decorate([
    (0, common_1.Controller)('goats'),
    __metadata("design:paramtypes", [goat_service_1.GoatService])
], GoatController);
