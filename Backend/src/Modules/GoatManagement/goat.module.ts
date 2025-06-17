// src/lost-property/lost-property.module.ts
import { Module } from '@nestjs/common';
import { GoatService } from './goat.service';
import { GoatController } from './goat.controller';
import { EmailService } from './Email.service';  // Adjust path as needed
import { PrismaService } from '../../Prisma/prisma.service'; // Your prisma service

@Module({
  controllers: [GoatController],
  providers: [GoatService, EmailService, PrismaService],
})
export class GoatModule {}
