import { ApiPropertyOptional } from '@nestjs/swagger';

// you can add validate using class-validator
export class SingleFileDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    required: true,
    nullable: false,
  })
  file: string;
}
