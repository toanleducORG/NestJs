import {
  Controller,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';

import {
  // ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
} from '@nestjs/swagger';
import { Roles } from 'auth/auth/decorators/roles.decorator';
import { RolesGuard } from 'auth/auth/guards/roles.guard';
import { UserEntity } from './Entity/user.entity';
import { classToPlain } from 'class-transformer';

@ApiTags('User')
@Controller('users')
@UseGuards(RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('data')
  @ApiBearerAuth()
  @Roles('user')
  @ApiOperation({ summary: 'A private route for check the auth' })
  @ApiHeader({
    name: 'Bearer',
    description: 'the token we need for auth.',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({})
  async findAll(): Promise<unknown> {
    const users = await this.userService.findAll();

    return classToPlain(
      users.map((user) => new UserEntity(user.toJSON())),
      { excludePrefixes: ['_'] },
    );
  }
}
