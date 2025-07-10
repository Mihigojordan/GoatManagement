import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { JwtModule } from '@nestjs/jwt';
import { AdminAuthGuard } from 'src/Guards/AdminAuth.guard';
@Module({
  imports: [
    JwtModule.register({
      secret:  process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' }
    })
  ],
   controllers: [AdminController],
  providers: [AdminService, AdminAuthGuard], // ✅ add the guard here
  exports: [AdminAuthGuard, JwtModule],       // ✅ export if needed elsewhere
})
export class AdminModule {}
