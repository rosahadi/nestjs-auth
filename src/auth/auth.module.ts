import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PasswordService } from './password.service';
import { TypedConfigService } from 'src/config/typed-config.service';
import { AuthConfig } from 'src/config/auth.config';
import { RolesGuard } from './guards/roles.guard';
import { APP_GUARD } from '@nestjs/core';
import { GqlAuthGuard } from './guards/auth.guard';
import { VerifiedEmailGuard } from './guards/verified-email.guard';
import { TokenUtils } from './utils/token.utils';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: TypedConfigService) => ({
        secret: config.get<AuthConfig>('auth')?.jwt.secret,
        signOptions: {
          expiresIn: config.get<AuthConfig>('auth')?.jwt.expiresIn,
        },
      }),
    }),
  ],
  providers: [
    AuthResolver,
    AuthService,
    JwtStrategy,
    PasswordService,
    RolesGuard,
    GqlAuthGuard,
    VerifiedEmailGuard,
    TokenUtils,
    {
      provide: APP_GUARD,
      useClass: GqlAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: TypedConfigService,
      useExisting: ConfigService,
    },
  ],
  exports: [AuthService, PasswordService, TokenUtils],
})
export class AuthModule {}
