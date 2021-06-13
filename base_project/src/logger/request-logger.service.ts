import { utilities, WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { createDailyRotate } from './logger.config';

export const RequestLogger = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'MMM-DD-YYYY HH:mm:ss Z',
        }),
        utilities.format.nestLike(),
      ),
    }),
    createDailyRotate('info', 'info', 'request'),
    createDailyRotate('error', 'error', 'request'),
    createDailyRotate('warn', 'warn', 'request'),
  ],
});
