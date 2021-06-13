import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApplicationConfigService {
  constructor(private configService: ConfigService) {}

  get name(): string {
    return this.configService.get<string>('app.name');
  }
  get env(): string {
    return this.configService.get<string>('app.env');
  }
  get url(): string {
    return `${this.configService.get<string>('app.url')}:${this.port}`;
  }
  get port(): number {
    return this.configService.get<number>('app.port');
  }
  get isDev(): boolean {
    return this.env === 'development' ? true : false;
  }
  get jwt_sercret(): string {
    return this.configService.get<string>('app.jwt_secret');
  }
  get encrypt_jwt_secret(): string {
    return this.configService.get<string>('app.encrypt_jwt_secret');
  }
  get jwt_expiration(): number {
    return this.configService.get<number>('app.jwt_expiration');
  }
}
