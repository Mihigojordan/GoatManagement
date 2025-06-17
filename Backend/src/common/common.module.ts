import { Global, Module } from '@nestjs/common';
import { OtpManagementService } from '../Global/Otp-management/otp-management.service';
import { LoggerService } from './Log/logger.service';

@Global()
@Module({
  providers: [OtpManagementService, LoggerService],
  exports: [OtpManagementService, LoggerService],
})
export class CommonModule {}
