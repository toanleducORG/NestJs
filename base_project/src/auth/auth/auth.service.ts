import { JwtPayload } from './interfaces/jwt-payload.interface';
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
  Req,
} from '@nestjs/common';
import { addHours } from 'date-fns';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { sign } from 'jsonwebtoken';
import { UserInterface } from 'user/interfaces/user.interface';
import { v4 } from 'uuid';
import { FastifyRequest } from 'fastify';
import { getClientIp } from 'request-ip';
import { lookup } from 'geoip-country';
import Cryptr from 'cryptr';
import { CreateUserDto } from 'user/dto/create-user.dto';
import { UserService } from 'user/user.service';
import { VerifyUuidDto } from 'user/dto/verify-uuid.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RefreshAccessTokenDto } from './dto/refresh-access-token.dto';
import { CreateForgotPasswordDto } from './dto/create-forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenService } from 'auth/refresh-token/refresh-token.service';
import { UserModel } from 'user/schemas/user.schema';
import { ForgotPasswordService } from '../forgot-password/forgot-password.service';
import { ForgotPasswordModel } from '../forgot-password/schemas/forgot-password.schema';
import { ApplicationConfigService } from 'core/config/application/application.service';
import { RefreshToken } from 'auth/refresh-token/interface/refresh-token.interface';
import { ForgotPasswordInterFace } from 'auth/forgot-password/interfaces/forgot-password.interface';

@Injectable()
export class AuthService {
  cryptr: any;
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly appConfig: ApplicationConfigService,
    @InjectModel(UserModel.name) private readonly userModel: Model<UserModel>,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly forgotPasswordService: ForgotPasswordService,
  ) {
    this.cryptr = new Cryptr(appConfig.encrypt_jwt_secret);
  }

  private async createAccessToken(userId: string) {
    const accessToken = sign({ userId }, this.appConfig.jwt_sercret, {
      expiresIn: process.env.JWT_EXPIRATION,
    });
    return this.encryptText(accessToken);
  }

  private async createRefreshToken(@Req() req: FastifyRequest, userId: string) {
    const input: RefreshToken = {
      userId,
      refreshToken: v4(),
      ip: this.getIp(req),
      browser: this.getBrowserInfo(req),
      country: this.getCountry(req),
    };
    const refreshToken = await this.refreshTokenService.createRefreshToken(
      input,
    );
    return refreshToken;
  }

  async findRefreshToken(token: string) {
    const userId = await this.refreshTokenService.findRefreshToken(token);
    return userId;
  }

  async validateUser(jwtPayload: JwtPayload): Promise<any> {
    const user = await this.userModel.findOne({
      _id: jwtPayload.userId,
      verified: true,
    });
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }
    return user;
  }

  //   ┬┬ ┬┌┬┐  ┌─┐─┐ ┬┌┬┐┬─┐┌─┐┌─┐┌┬┐┌─┐┬─┐
  //   ││││ │   ├┤ ┌┴┬┘ │ ├┬┘├─┤│   │ │ │├┬┘
  //  └┘└┴┘ ┴   └─┘┴ └─ ┴ ┴└─┴ ┴└─┘ ┴ └─┘┴└─
  private jwtExtractor(request) {
    let token = null;
    if (request.headers.authorization) {
      token = request.headers.authorization
        .replace('Bearer ', '')
        .replace(' ', '');
    } else if (request.headers.bearer) {
      token = request.headers.bearer;
    } else if (request.body.token) {
      token = request.body.token.replace(' ', '');
    } else if (request.query.token) {
      token = request.body.token.replace(' ', '');
    }
    const cryptr = new Cryptr(process.env.ENCRYPT_JWT_SECRET);
    if (token) {
      try {
        token = cryptr.decrypt(token);
      } catch (err) {
        throw new BadRequestException('Bad request.');
      }
    }
    return token;
  }

  // ***********************
  // ╔╦╗╔═╗╔╦╗╦ ╦╔═╗╔╦╗╔═╗
  // ║║║║╣  ║ ╠═╣║ ║ ║║╚═╗
  // ╩ ╩╚═╝ ╩ ╩ ╩╚═╝═╩╝╚═╝
  // ***********************
  returnJwtExtractor() {
    return this.jwtExtractor;
  }

  getIp(req: FastifyRequest): string {
    return getClientIp(req);
  }

  getBrowserInfo(req: FastifyRequest): string {
    return req.headers['user-agent'] || 'XX';
  }

  getCountry(req: FastifyRequest): string {
    return lookup(this.getIp(req))?.country || 'XX';
  }

  encryptText(text: string): string {
    return this.cryptr.encrypt(text);
  }

  async saveForgotPassword(
    req: FastifyRequest,
    createForgotPasswordDto: CreateForgotPasswordDto,
  ) {
    const forgotPassword: ForgotPasswordInterFace = {
      email: createForgotPasswordDto.email,
      verification: v4(),
      expires: addHours(new Date(), this.userService.HOURS_TO_VERIFY),
      ip: this.getIp(req),
      browser: this.getBrowserInfo(req),
      country: this.getCountry(req),
    };
    await this.forgotPasswordService.createForgotPassword(forgotPassword);
  }

  async setForgotPasswordFirstUsed(
    req: FastifyRequest,
    forgotPassword: ForgotPasswordModel,
  ) {
    forgotPassword.firstUsed = true;
    forgotPassword.ipChanged = this.getIp(req);
    forgotPassword.browserChanged = this.getBrowserInfo(req);
    forgotPassword.countryChanged = this.getCountry(req);
    await forgotPassword.save();
  }

  async findForgotPasswordByEmail(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<ForgotPasswordModel> {
    const forgotPassword =
      await this.forgotPasswordService.findForgotPasswordByEmail(
        resetPasswordDto.email,
      );
    return forgotPassword;
  }

  async findForgotPasswordByUuid(
    verifyUuidDto: VerifyUuidDto,
  ): Promise<ForgotPasswordModel> {
    const forgotPassword =
      await this.forgotPasswordService.findForgotPasswordByUuid(
        verifyUuidDto.verification,
      );
    return forgotPassword;
  }
  // ┌─┐┬─┐┌─┐┌─┐┌┬┐┌─┐  ┬ ┬┌─┐┌─┐┬─┐
  // │  ├┬┘├┤ ├─┤ │ ├┤   │ │└─┐├┤ ├┬┘
  // └─┘┴└─└─┘┴ ┴ ┴ └─┘  └─┘└─┘└─┘┴└─
  async create(createUserDto: CreateUserDto): Promise<UserInterface> {
    const user = new this.userModel(createUserDto);
    await this.userService.isEmailUnique(user.email);
    this.userService.setRegistrationInfo(user);
    await user.save();
    return this.userService.buildRegistrationInfo(user);
  }

  // ┬  ┬┌─┐┬─┐┬┌─┐┬ ┬  ┌─┐┌┬┐┌─┐┬┬
  // └┐┌┘├┤ ├┬┘│├┤ └┬┘  ├┤ │││├─┤││
  //  └┘ └─┘┴└─┴└   ┴   └─┘┴ ┴┴ ┴┴┴─┘
  async verifyEmail(req: FastifyRequest, verifyUuidDto: VerifyUuidDto) {
    const user = await this.userService.findByVerification(
      verifyUuidDto.verification,
    );
    await this.userService.setUserAsVerified(user);
    return {
      fullName: user.fullName,
      email: user.email,
      accessToken: await this.createAccessToken(user._id),
      refreshToken: await this.createRefreshToken(req, user._id),
    };
  }

  // ┬  ┌─┐┌─┐┬┌┐┌
  // │  │ ││ ┬││││
  // ┴─┘└─┘└─┘┴┘└┘
  async login(req: FastifyRequest, loginUserDto: LoginUserDto) {
    const user = await this.userService.findUserByEmail(loginUserDto.email);
    this.userService.isUserBlocked(user);
    await this.userService.checkPassword(loginUserDto.password, user);
    await this.userService.passwordsAreMatch(user);
    return {
      fullName: user.fullName,
      email: user.email,
      accessToken: await this.createAccessToken(user._id),
      refreshToken: await this.createRefreshToken(req, user._id),
    };
  }

  // ┬─┐┌─┐┌─┐┬─┐┌─┐┌─┐┬ ┬  ┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐  ┌┬┐┌─┐┬┌─┌─┐┌┐┌
  // ├┬┘├┤ ├┤ ├┬┘├┤ └─┐├─┤  ├─┤│  │  ├┤ └─┐└─┐   │ │ │├┴┐├┤ │││
  // ┴└─└─┘└  ┴└─└─┘└─┘┴ ┴  ┴ ┴└─┘└─┘└─┘└─┘└─┘   ┴ └─┘┴ ┴└─┘┘└┘
  async refreshAccessToken(refreshAccessTokenDto: RefreshAccessTokenDto) {
    const userId = await this.findRefreshToken(
      refreshAccessTokenDto.refreshToken,
    );
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('Bad request');
    }
    return {
      accessToken: await this.createAccessToken(user._id),
    };
  }

  // ┌─┐┌─┐┬─┐┌─┐┌─┐┌┬┐  ┌─┐┌─┐┌─┐┌─┐┬ ┬┌─┐┬─┐┌┬┐
  // ├┤ │ │├┬┘│ ┬│ │ │   ├─┘├─┤└─┐└─┐││││ │├┬┘ ││
  // └  └─┘┴└─└─┘└─┘ ┴   ┴  ┴ ┴└─┘└─┘└┴┘└─┘┴└──┴┘
  async forgotPassword(
    req: FastifyRequest,
    createForgotPasswordDto: CreateForgotPasswordDto,
  ) {
    await this.userService.findByEmail(createForgotPasswordDto.email);
    await this.saveForgotPassword(req, createForgotPasswordDto);
    return {
      email: createForgotPasswordDto.email,
      message: 'verification sent.',
    };
  }

  // ┌─┐┌─┐┬─┐┌─┐┌─┐┌┬┐  ┌─┐┌─┐┌─┐┌─┐┬ ┬┌─┐┬─┐┌┬┐  ┬  ┬┌─┐┬─┐┬┌─┐┬ ┬
  // ├┤ │ │├┬┘│ ┬│ │ │   ├─┘├─┤└─┐└─┐││││ │├┬┘ ││  └┐┌┘├┤ ├┬┘│├┤ └┬┘
  // └  └─┘┴└─└─┘└─┘ ┴   ┴  ┴ ┴└─┘└─┘└┴┘└─┘┴└──┴┘   └┘ └─┘┴└─┴└   ┴
  async forgotPasswordVerify(
    req: FastifyRequest,
    verifyUuidDto: VerifyUuidDto,
  ) {
    const forgotPassword = await this.findForgotPasswordByUuid(verifyUuidDto);
    await this.setForgotPasswordFirstUsed(req, forgotPassword);
    return {
      email: forgotPassword.email,
      message: 'now reset your password.',
    };
  }

  // ┬─┐┌─┐┌─┐┌─┐┌┬┐  ┌─┐┌─┐┌─┐┌─┐┬ ┬┌─┐┬─┐┌┬┐
  // ├┬┘├┤ └─┐├┤  │   ├─┘├─┤└─┐└─┐││││ │├┬┘ ││
  // ┴└─└─┘└─┘└─┘ ┴   ┴  ┴ ┴└─┘└─┘└┴┘└─┘┴└──┴┘
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const forgotPassword = await this.findForgotPasswordByEmail(
      resetPasswordDto,
    );
    await this.forgotPasswordService.setForgotPasswordFinalUsed(forgotPassword);
    await this.userService.resetUserPassword(resetPasswordDto);
    return {
      email: resetPasswordDto.email,
      message: 'password successfully changed.',
    };
  }
}
