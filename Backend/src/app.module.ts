// app.module.ts
import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './Modules/admin/admin.module';
import { PrismaModule } from './Prisma/prisma.module';
import { GoatModule } from './Modules/GoatManagement/goat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    PrismaModule, 
    CommonModule,
    AdminModule,
    GoatModule
  ],


})
export class AppModule { }
