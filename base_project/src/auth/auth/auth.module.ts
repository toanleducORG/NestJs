import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema, UserModel } from 'user/schemas/user.schema';
import { AuthController } from './auth.controller';
import { UserModule } from 'user/user.module';
import { ForgotPasswordModule } from 'auth/forgot-password/forgot-password.module';
import { RefreshTokenModule } from 'auth/refresh-token/refresh-token.module';
import { ApplicationConfigModule } from '../../core/config/application/application.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    }),
    UserModule,
    ForgotPasswordModule,
    RefreshTokenModule,
    ApplicationConfigModule,
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
