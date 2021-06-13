import { registerAs } from '@nestjs/config';

export default registerAs('mongo', () => ({
  mongo_uri: process.env.MONGO_URI,
}));
