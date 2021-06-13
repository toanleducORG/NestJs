import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyUuidDto {
  @ApiPropertyOptional({
    description: 'uuid to verify user',
    format: 'uuid',
    uniqueItems: true,
  })
  @IsNotEmpty()
  @IsUUID()
  readonly verification: string;
}
