import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ForgotPasswordModel } from './schemas/forgot-password.schema';
import { Model } from 'mongoose';
import { ForgotPasswordInterFace } from './interfaces/forgot-password.interface';

@Injectable()
export class ForgotPasswordService {
  constructor(
    @InjectModel(ForgotPasswordModel.name)
    private readonly forgotPasswordModel: Model<ForgotPasswordModel>,
  ) {}

  async createForgotPassword(input: ForgotPasswordInterFace): Promise<void> {
    const forgotPassword = new ForgotPasswordModel(input);
    await forgotPassword.save();
  }

  async setForgotPasswordFinalUsed(forgotPassword: ForgotPasswordModel) {
    forgotPassword.finalUsed = true;
    await forgotPassword.save();
  }

  async findForgotPasswordByEmail(email: string): Promise<ForgotPasswordModel> {
    const forgotPassword = await this.forgotPasswordModel.findOne({
      email: email,
      firstUsed: true,
      finalUsed: false,
      expires: { $gt: new Date() },
    });
    if (!forgotPassword) {
      throw new BadRequestException('Bad request.');
    }
    return forgotPassword;
  }

  async findForgotPasswordByUuid(
    verification: string,
  ): Promise<ForgotPasswordModel> {
    const forgotPassword = await this.forgotPasswordModel.findOne({
      verification: verification,
      firstUsed: false,
      finalUsed: false,
      expires: { $gt: new Date() },
    });
    if (!forgotPassword) {
      throw new BadRequestException('Bad request.');
    }
    return forgotPassword;
  }
}
