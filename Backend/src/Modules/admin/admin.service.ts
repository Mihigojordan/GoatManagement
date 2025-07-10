import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../Prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
async registerAdmin(email: string, password: string, names: string, role = 'admin') {
  try {
    if (!this.emailRegex.test(email) || !password || !names) {
      throw new BadRequestException('Email, password, and names are required');
    }

    if (password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters long');
    }

    const existingAdmin = await this.prismaService.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      throw new BadRequestException('Admin with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createdAdmin = await this.prismaService.admin.create({
      data: {
        email,
        password: hashedPassword,
        names,
        role, // ✅ Save role here
      },
    });

    if (!createdAdmin) {
      throw new InternalServerErrorException('Failed to create admin');
    }

    return {
      message: 'Admin registered successfully',
      admin: createdAdmin,
    };
  } catch (error) {
    console.error('Error registering admin:', error);
    throw new InternalServerErrorException('Unexpected error');
  }
}


  async adminLogin(email: string, password: string) {
    try {
      if (!this.emailRegex.test(email) || !password) {
        throw new BadRequestException('Email and password are required');
      }

      if (password.length < 6) {
        throw new BadRequestException('Password must be at least 6 characters long');
      }

      const admin = await this.prismaService.admin.findUnique({
        where: { email },
      });

      if (!admin) {
        throw new BadRequestException('Unknown credentials');
      }

      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        throw new BadRequestException('Invalid credentials');
      }

      const token = this.jwtService.sign({ id: admin.id, role: 'admin' });

      return {
        message: 'Admin logged in successfully',
        token,
      };
    } catch (error) {
      console.error('Error logging in admin:', error);
    }
  }

  async logout() {
    return { message: 'Logout successful (client should clear token)' };
  }

  async getAdminProfile(adminId: string) {
    try {
      const admin = await this.prismaService.admin.findUnique({
        where: { id: adminId },
      });

      if (!admin) {
        throw new BadRequestException('Admin not found');
      }
      return admin;
    } catch (error) {
      console.error('Error fetching admin profile:', error);
    }
  }
}
