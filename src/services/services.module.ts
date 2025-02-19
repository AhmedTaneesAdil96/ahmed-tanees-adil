import { DynamicModule, Module } from '@nestjs/common';
import { FileService } from './file.service';

@Module({})
export class ServicesModule {
  static forRoot(): DynamicModule {
    const Services = [FileService];

    return {
      module: ServicesModule,
      providers: [...Services],
      exports: [...Services],
      imports: [],
    };
  }
}
