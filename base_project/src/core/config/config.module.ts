import { Module } from '@nestjs/common';
import { ApplicationConfigModule } from './application/application.module';
import { MongoConfigModule } from './database/mongo/mongo.module';

@Module({
  imports: [ApplicationConfigModule, MongoConfigModule],
})
export class ConfiguationModule {}
