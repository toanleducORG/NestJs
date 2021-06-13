import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MongoConfigService {
  static mongo_uri: string = process.env.MONGO_URI;
  constructor(private configService: ConfigService) {}

  get mongo_uri(): string {
    return this.configService.get<string>('mongo.mongo_uri');
  }
}
