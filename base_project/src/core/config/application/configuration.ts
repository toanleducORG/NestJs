import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  env: process.env.APP_ENV,
  name: process.env.APP_NAME,
  url: process.env.APP_URL,
  port: process.env.APP_PORT,
  jwt_secret: process.env.JWT_SECRET,
  encrypt_jwt_secret: process.env.ENCRYPT_JWT_SECRET,
  jwt_expiration: process.env.JWT_EXPIRATION,
}));
