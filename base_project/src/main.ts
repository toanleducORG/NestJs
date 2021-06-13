import { NestFactory } from '@nestjs/core';
import { fastifyHelmet } from 'fastify-helmet';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCsrf from 'fastify-csrf';
import fastifyCookie from 'fastify-cookie';
import compression from 'fastify-compress';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApplicationConfigService } from 'core/config/application/application.service';
import { UserModule } from 'user/user.module';
import { AuthModule } from 'auth/auth/auth.module';
import { ValidationPipe } from '@nestjs/common';
import { ExceptionFactory } from 'core/exception/exceptionFactory';
import { LoggerConfig } from 'logger/logger.config';
import { UploadFileModule } from './core/uploadFile/upload.module';
import { contentParser } from 'fastify-multer';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // ennable CORS
  app.enableCors();

  // register helmet plugin
  await app.register(fastifyHelmet, {
    contentSecurityPolicy: false,
  });
  // CSRF Protection
  app.register(fastifyCookie);
  app.register(fastifyCsrf);

  // register compression plugin
  app.register(compression);

  // register validatiion Pipe (validate input)
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: ExceptionFactory,
    }),
  );

  app.register(contentParser);

  const appConfig: ApplicationConfigService = app.get(
    'ApplicationConfigService',
  );

  // swagger
  const swaggerOptions = new DocumentBuilder()
    .setTitle('Nest Tutorial')
    .setDescription('API Documentation')
    .setVersion('1.0.0')
    .addBasicAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerOptions, {
    include: [UserModule, AuthModule, UploadFileModule],
  });

  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
    },
  });

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  // use custom logger
  app.useLogger(LoggerConfig);

  // launch app
  await app.listen(appConfig.port, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
