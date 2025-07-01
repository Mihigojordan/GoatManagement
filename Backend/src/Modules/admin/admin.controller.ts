import {
    BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { RequestWithAdmin } from '../../common/interfaces/request-admin.interface';
import { AdminAuthGuard } from '../../Guards/AdminAuth.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminServices: AdminService) {}

  @Post('register')
  async adminRegister(@Body() req: any) {
    const { email, password, names } = req;
    return await this.adminServices.registerAdmin(email, password, names);
  }

  @Post('login')
  async adminLogin(@Body() req: any) {
    const { email, password } = req;
    return await this.adminServices.adminLogin(email, password);
  }

  @Post('logout')
  async adminLogout() {
    return await this.adminServices.logout();
  }

@Get('profile')
@UseGuards(AdminAuthGuard)
async getAdminProfile(@Req() req: RequestWithAdmin) {
  const adminId = req.admin?.id;

  if (!adminId) {
    throw new BadRequestException('Admin ID not found in token');
  }

  return await this.adminServices.getAdminProfile(adminId);
}

}
