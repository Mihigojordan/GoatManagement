import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../Prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
) {}

  emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  async registerAdmin(email: string, password: string, names: string) {
    try {
      // check if the  email and password are provided
      if (!this.emailRegex.test(email) || !password || !names) {
        throw new BadRequestException('Email and password are required');
      }

      if (password.length < 6) {
        throw new BadRequestException(
          'Password must be at least 6 characters long',
        );
      }

      // check if the admin email already exists

      const existingAdmin = await this.prismaService.admin.findUnique({
        where: { email: email },
      });
      if (existingAdmin) {
        throw new BadRequestException('Admin with this email already exists');
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
        throw new InternalServerErrorException('failed to create admin');
      }

      return { message: 'admin registered successfully', admin: createdAdmin };
    } catch (error) {
      console.error('Error registering admin:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async adminLogin(email: string, password: string, res: Response) {
    try {
      // check if the email and password are provided
      if (!this.emailRegex.test(email) || !password) {
        throw new BadRequestException('Email and password are required');
      }
      // if the password is less than 6 characters
      if (password.length < 6) {
        throw new BadRequestException(
          'Password must be at least 6 characters long',
        );
      }
      // find the admin by email
      const admin = await this.prismaService.admin.findUnique({
        where: { email: email },
      });

      if (!admin) {
        throw new BadRequestException('unknown credentials');
      }
      // compare the password with the hashed password
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        throw new BadRequestException('Invalid credentials');
      }
      // if the password is valid, return the admin

      const token = this.jwtService.sign({ id: admin.id, role: 'admin' });

   res.cookie('adminAccessToken', token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'none', // Adjust based on your needs
        domain:  '.abyride.com'
      });


      return { message: 'Admin logged in successfully' };
    } catch (error) {
      console.error('Error logging in admin:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async logout(res: Response) {
    try {
       res.clearCookie('adminAccessToken', {
     httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 day
        sameSite: 'none', // Adjust based on your needs
        domain:  '.abyride.com'

      });
      return { message: 'Admin logged out successfully' };
    } catch (error) {
      console.error('Error logging out admin:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAdminProfile(adminId: string) {
    try {
      const admin = await this.prismaService.admin.findUnique({
        where: { id: adminId },
      });
    
      

      if (!admin) {
        throw new BadRequestException('admin not found');
      }
      return admin;
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  

}
