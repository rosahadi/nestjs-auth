import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { User } from './user.entity';
import { ConfigService } from '@nestjs/config';
import { TypedConfigService } from 'src/config/typed-config.service';
import { AuthModule } from 'src/auth/auth.module';
import { PasswordService } from 'src/auth/password.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => AuthModule)],
  providers: [
    UserService,
    UserResolver,
    PasswordService,
    {
      provide: TypedConfigService,
      useExisting: ConfigService,
    },
  ],
  exports: [UserService, PasswordService],
})
export class UserModule {}
