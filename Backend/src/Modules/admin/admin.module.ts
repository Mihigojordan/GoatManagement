import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [AdminService],
  controllers: [AdminController],
  imports: [
    JwtModule.register({
      secret:  process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' }
    })
  ],
})
export class AdminModule {}
