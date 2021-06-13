import { ValidationError } from 'class-validator';
import { ExceptionError } from './interface/exceptionError.interface';
import { BadRequestException } from '@nestjs/common';

export const ExceptionFactory = (errors: ValidationError[]) => {
  const mewErrors: ExceptionError[] = errors.map((error) => {
    return {
      key: error.property,
      message: Object.values(error.constraints),
    };
  });
  throw new BadRequestException(mewErrors);
};
