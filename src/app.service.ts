import { Injectable } from '@nestjs/common';
import { Public } from './decorators/SetMetadata';
// import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService{
  getHello(): string {
    return 'Hello World!';
  }
}
