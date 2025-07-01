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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
let AdminAuthGuard = class AdminAuthGuard {
    jwtService;
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromCookies(request);
        if (!token) {
            throw new common_1.UnauthorizedException('authentication admin token is missing');
        }
        try {
            const decodedAdmin = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET, // Ensure JWT_SECRET is securely stored
            });
            // Optional: Extend with custom admin checks here (e.g., isBlocked, verified, etc.)
            // Attach decoded admin data to request for downstream usage
            request.admin = decodedAdmin;
            return true; // Placeholder, implement your logic
        }
        catch (error) {
            throw new common_1.UnauthorizedException('invalid or expired token');
        }
    }
    extractTokenFromCookies(req) {
        return req.cookies?.['adminAccessToken'];
    }
};
exports.AdminAuthGuard = AdminAuthGuard;
exports.AdminAuthGuard = AdminAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], AdminAuthGuard);
