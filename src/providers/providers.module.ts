import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { HttpCustomService } from './http/http-custom.service';

@Module( {
    imports: [ HttpModule ],
    providers: [ HttpCustomService ],
    exports: [ HttpCustomService ]
} )
export class ProvidersModule { }
