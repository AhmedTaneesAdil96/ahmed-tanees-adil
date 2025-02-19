import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ControllersModule } from './controllers/controllers.module';
import { ServicesModule } from './services/services.module';

@Module({
  imports: [ServicesModule, ControllersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
