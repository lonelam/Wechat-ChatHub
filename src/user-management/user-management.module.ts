import { Module } from '@nestjs/common';
import { UserManagementService } from './user-management.service';
import { ChatdbModule } from 'src/chatdb/chatdb.module';

@Module({
  providers: [UserManagementService],
  imports: [ChatdbModule],
  exports: [UserManagementService],
})
export class UserManagementModule {}
