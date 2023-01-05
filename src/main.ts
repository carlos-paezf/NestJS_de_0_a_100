import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import * as morgan from 'morgan'

import { AppModule } from './app.module'
import { CORS } from './constants'


async function bootstrap () {
    const app = await NestFactory.create( AppModule )

    app.use( morgan( 'combined' ) )

    app.useGlobalPipes( new ValidationPipe( {
        transformOptions: {
            enableImplicitConversion: true
        }
    } ) )

    const configService = app.get( ConfigService )

    app.enableCors( CORS )
    app.setGlobalPrefix( 'api' )

    await app.listen( configService.get( 'PORT' ) )
    console.log( `Application running on: ${ await app.getUrl() }` )
}

bootstrap()
