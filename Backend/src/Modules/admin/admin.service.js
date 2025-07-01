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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../Prisma/prisma.service");
const bcrypt = __importStar(require("bcryptjs"));
const jwt_1 = require("@nestjs/jwt");
let AdminService = class AdminService {
    prismaService;
    jwtService;
    constructor(prismaService, jwtService) {
        this.prismaService = prismaService;
        this.jwtService = jwtService;
    }
    emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    async registerAdmin(email, password, names) {
        try {
            // check if the  email and password are provided
            if (!this.emailRegex.test(email) || !password || !names) {
                throw new common_1.BadRequestException('Email and password are required');
            }
            if (password.length < 6) {
                throw new common_1.BadRequestException('Password must be at least 6 characters long');
            }
            // check if the admin email already exists
            const existingAdmin = await this.prismaService.admin.findUnique({
                where: { email: email },
            });
            if (existingAdmin) {
                throw new common_1.BadRequestException('Admin with this email already exists');
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            // create a new admin
            const createdAdmin = await this.prismaService.admin.create({
                data: {
                    email: email,
                    password: hashedPassword,
                    names: names,
                },
            });
            if (!createdAdmin) {
                throw new common_1.InternalServerErrorException('failed to create admin');
            }
            return { message: 'admin registered successfully', admin: createdAdmin };
        }
        catch (error) {
            console.error('Error registering admin:', error);
            // throw new InternalServerErrorException(error.message);
        }
    }
    async adminLogin(email, password, res) {
        try {
            // check if the email and password are provided
            if (!this.emailRegex.test(email) || !password) {
                throw new common_1.BadRequestException('Email and password are required');
            }
            // if the password is less than 6 characters
            if (password.length < 6) {
                throw new common_1.BadRequestException('Password must be at least 6 characters long');
            }
            // find the admin by email
            const admin = await this.prismaService.admin.findUnique({
                where: { email: email },
            });
            if (!admin) {
                throw new common_1.BadRequestException('unknown credentials');
            }
            // compare the password with the hashed password
            const isPasswordValid = await bcrypt.compare(password, admin.password);
            if (!isPasswordValid) {
                throw new common_1.BadRequestException('Invalid credentials');
            }
            // if the password is valid, return the admin
            const token = this.jwtService.sign({ id: admin.id, role: 'admin' });
            res.cookie('adminAccessToken', token, {
                httpOnly: true,
                sameSite: 'none',
                maxAge: 1000 * 60 * 60 * 24 * 7,
                secure: true,
            });
            return { message: 'Admin logged in successfully' };
        }
        catch (error) {
            console.error('Error logging in admin:', error);
            // throw new InternalServerErrorException(error.message);
        }
    }
    async logout(res) {
        try {
            res.clearCookie('adminAccessToken', {
                httpOnly: true,
                sameSite: 'none',
                secure: true,
            });
            return { message: 'Admin logged out successfully' };
        }
        catch (error) {
            console.error('Error logging out admin:', error);
            // throw new InternalServerErrorException(error.message);
        }
    }
    async getAdminProfile(adminId) {
        try {
            const admin = await this.prismaService.admin.findUnique({
                where: { id: adminId },
            });
            if (!admin) {
                throw new common_1.BadRequestException('admin not found');
            }
            return admin;
        }
        catch (error) {
            console.error('Error fetching admin profile:', error);
            // throw new InternalServerErrorException(error.message);
        }
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AdminService);
