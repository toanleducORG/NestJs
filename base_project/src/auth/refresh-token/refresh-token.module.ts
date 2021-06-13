import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RefresTokenModel,
  RefreshTokenSchema,
} from 'auth/refresh-token/schemas/refresh-token.schema';
import { RefreshTokenService } from './refresh-token.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RefresTokenModel.name, schema: RefreshTokenSchema },
    ]),
  ],
  exports: [RefreshTokenService],
  providers: [RefreshTokenService],
})
export class RefreshTokenModule {}
