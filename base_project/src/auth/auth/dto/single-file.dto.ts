import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';

// you can add validate using class-validator
export class SingleFileDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    required: true,
  })
  @IsString()
  file: string;
}
