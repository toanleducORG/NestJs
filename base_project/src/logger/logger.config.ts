import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

export const createDailyRotate = (
  filename: string,
  level: string,
  folder: string,
): DailyRotateFile => {
  return new DailyRotateFile({
    dirname: `./src/logger/${folder}/%DATE%h/`,
    filename: `${filename}.log`,
    datePattern: 'YYYY-MM-DD HH',
    level: level,
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'MMM-DD-YYYY HH:mm:ss Z',
      }),
      nestWinstonModuleUtilities.format.nestLike(),
      winston.format.json({ space: 2 }),
    ),
  });
};

export const LoggerConfig = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'MMM-DD-YYYY HH:mm:ss Z',
        }),
        nestWinstonModuleUtilities.format.nestLike(),
      ),
    }),
    createDailyRotate('info', 'info', 'storage'),
    createDailyRotate('error', 'error', 'storage'),
    createDailyRotate('warn', 'warn', 'storage'),
  ],
});
