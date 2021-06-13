import { Module } from '@nestjs/common';
import * as Joi from '@hapi/joi';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './configuration';
import { ApplicationConfigService } from './application.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema: Joi.object({
        APP_NAME: Joi.string().default('NestTutorial'),
        APP_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        APP_URL: Joi.string().default('http://localhost'),
        APP_PORT: Joi.number().default(8080),
      }),
    }),
  ],
  providers: [ConfigService, ApplicationConfigService],
  exports: [ConfigService, ApplicationConfigService],
})
export class ApplicationConfigModule {}
