"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoatModule = void 0;
// src/lost-property/lost-property.module.ts
const common_1 = require("@nestjs/common");
const goat_service_1 = require("./goat.service");
const goat_controller_1 = require("./goat.controller");
const Email_service_1 = require("./Email.service"); // Adjust path as needed
const prisma_service_1 = require("../../Prisma/prisma.service"); // Your prisma service
let GoatModule = class GoatModule {
};
exports.GoatModule = GoatModule;
exports.GoatModule = GoatModule = __decorate([
    (0, common_1.Module)({
        controllers: [goat_controller_1.GoatController],
        providers: [goat_service_1.GoatService, Email_service_1.EmailService, prisma_service_1.PrismaService],
    })
], GoatModule);
