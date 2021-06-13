import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { RefreshToken } from 'auth/refresh-token/interface/refresh-token.interface';
import { RefresTokenModel } from 'auth/refresh-token/schemas/refresh-token.schema';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectModel(RefresTokenModel.name)
    private readonly refreshTokenModel: Model<RefresTokenModel>,
  ) {}

  async createRefreshToken(input: RefreshToken): Promise<string> {
    const refreshToken = new this.refreshTokenModel(input);
    await refreshToken.save();
    return refreshToken.refreshToken;
  }

  async findRefreshToken(token: string) {
    const refreshToken = await this.refreshTokenModel.findOne({
      refreshToken: token,
    });
    if (!refreshToken) {
      throw new UnauthorizedException('User has been logged out.');
    }
    return refreshToken.userId;
  }
}
