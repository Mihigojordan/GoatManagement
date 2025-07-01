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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
const AdminAuth_guard_1 = require("../../Guards/AdminAuth.guard");
let AdminController = class AdminController {
    adminServices;
    constructor(adminServices) {
        this.adminServices = adminServices;
    }
    async adminRegister(req) {
        const { email, password, names } = req;
        try {
            return await this.adminServices.registerAdmin(email, password, names);
        }
        catch (error) {
            console.error('Error registering admin:', error);
            // throw new InternalServerErrorException({ error: error.error ,message: error.message})
        }
    }
    async adminLogin(req, res) {
        const { email, password } = req;
        try {
            return await this.adminServices.adminLogin(email, password, res);
        }
        catch (error) {
            console.error('Error logging in admin:', error);
            // throw new InternalServerErrorException({ error: error.error ,message: error.message})
        }
    }
    async adminLogout(res) {
        try {
            return await this.adminServices.logout(res);
        }
        catch (error) {
            console.error('Error logging out admin:', error);
            // throw new InternalServerErrorException({ error: error.error ,message: error.message})
        }
    }
    async getAdminProfile(req) {
        try {
            const admin = req.admin;
            const adminId = admin?.id;
            console.log('admin id', admin?.id);
            return await this.adminServices.getAdminProfile(adminId);
        }
        catch (error) {
            console.error('Error fetching admin profile:', error);
            // throw new InternalServerErrorException({ error: error.error ,message: error.message});
        }
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "adminRegister", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "adminLogin", null);
__decorate([
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "adminLogout", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, common_1.UseGuards)(AdminAuth_guard_1.AdminAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAdminProfile", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
