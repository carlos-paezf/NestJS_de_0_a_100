import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as morgan from 'morgan';

import { AppModule } from './app.module';
import { CORS } from './constants';


async function bootstrap () {
    const app = await NestFactory.create( AppModule );

    app.use( morgan( 'combined' ) );

    app.useGlobalPipes( new ValidationPipe( {
        transformOptions: {
            enableImplicitConversion: true
        }
    } ) );

    const reflector = app.get( Reflector );
    app.useGlobalInterceptors( new ClassSerializerInterceptor( reflector ) );

    const configService = app.get( ConfigService );

    app.enableCors( CORS );
    app.setGlobalPrefix( 'api' );

    const documentConfig = new DocumentBuilder()
        .setTitle( 'Gestor de proyectos' )
        .setDescription( 'Gestión de proyectos y tareas asignadas' )
        .setVersion( '1.0' )
        .build();

    const document = SwaggerModule.createDocument( app, documentConfig );
    SwaggerModule.setup( 'docs', app, document );

    await app.listen( configService.get( 'PORT' ) );
    console.log( `Application running on: ${ await app.getUrl() }` );
}

bootstrap();
