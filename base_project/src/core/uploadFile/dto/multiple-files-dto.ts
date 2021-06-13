import { ApiPropertyOptional } from '@nestjs/swagger';

export class MultipleFileDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    required: true,
    nullable: false,
  })
  files: string[];
}
