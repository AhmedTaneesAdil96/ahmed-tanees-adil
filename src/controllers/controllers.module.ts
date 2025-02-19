import {Module} from '@nestjs/common';
import {FileController} from "./file.controller";
import {ServicesModule} from "../services/services.module";


@Module({
  imports: [
    ServicesModule.forRoot(),
  ],
  controllers: [FileController],
})
export class ControllersModule {}
