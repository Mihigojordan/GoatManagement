import { Body, Controller, Get, InternalServerErrorException, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Request, Response } from 'express';
import { AdminAuthGuard } from '../../Guards/AdminAuth.guard';
import { RequestWithAdmin } from '../../common/interfaces/request-admin.interface';

@Controller('admin')
export class AdminController {

    constructor( private readonly adminServices: AdminService ){}

    @Post('register')
    async adminRegister(@Body() req:any){
        const { email , password, names} = req
        try {
            return await this.adminServices.registerAdmin(email, password, names);
        } catch (error) {
            console.error('Error registering admin:', error);
            // throw new InternalServerErrorException({ error: error.error ,message: error.message})
        }
    }

    @Post('login')
    async adminLogin(@Body() req:any, @Res({ passthrough: true }) res: Response){
        const { email , password } = req
        try {
            return await this.adminServices.adminLogin(email, password, res);
        } catch (error) {
            console.error('Error logging in admin:', error);
            // throw new InternalServerErrorException({ error: error.error ,message: error.message})
        }
    }

    @Post('logout')
    async adminLogout(@Res({passthrough: true}) res: Response ){
        try {
            return await this.adminServices.logout(res);
        } catch (error) {
            console.error('Error logging out admin:', error);
            // throw new InternalServerErrorException({ error: error.error ,message: error.message})
        }
    }

    @Get('profile')
    @UseGuards(AdminAuthGuard)
    async getAdminProfile(@Req() req: RequestWithAdmin){
        try{
            const admin = req.admin;
            const adminId = admin?.id as string;
            console.log('admin id', admin?.id);
            return await this.adminServices.getAdminProfile(adminId);
        }catch(error) {
            console.error('Error fetching admin profile:', error);
            // throw new InternalServerErrorException({ error: error.error ,message: error.message});
        }
    }





}
