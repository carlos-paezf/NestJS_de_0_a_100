# Configuración y variables de entorno

Las variables de entorno nos permiten mantener seguras las credenciales o claves que requerimos dentro de nuestra aplicación. Para la primera parte de la configuración del proyecto necesitamos instalar un paquete con el siguiente comando:

```txt
pnpm i -S @nestjs/config
```

Dentro del archivo `app.module.ts` hacemos la importación del módulo de configuración para establecer las características globales de la misma, en este caso necesitamos declarar el archivo donde estarán las variables de entorno, pero como queremos hacerlo de manera independiente para cada entorno, entonces lo establecemos mediante un template string que reconozca a partir de un comando ejecutado, cual archivo debe reconocer:

```ts
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { UsersModule } from './users/users.module'


@Module( {
    imports: [
        ConfigModule.forRoot( {
            envFilePath: `.${ String( process.env.NODE_ENV ).trim() }.env`,
            isGlobal: true,
        } ),
        UsersModule
    ],
} )
export class AppModule { }
```

Dentro del archivo `package.json` definimos los scripts que se deben ejecutar según el entorno, los cuales también determinan el archivo de variables de entorno que debe leer el proyecto:

```json
{
    "scripts": {
        ...,
        "start:dev": "SET NODE_ENV=develop && nest start --watch ",
        ...
    },
}
```

Para el caso en que usemos el comando de producción, la variable de entorno `NODE_ENV` será `undefined`, por lo que debemos definir que la configuración del proyecto reconozca el archivo con las variables para dicho entorno, por lo tanto hacemos este cambio en `app.module.ts`:

```ts
...
@Module( {
    imports: [
        ConfigModule.forRoot( {
            envFilePath: [ `.${ String( process.env.NODE_ENV ).trim() }.env`, `.env` ],
            ...,
        } ),
        UsersModule
    ],
} )
export class AppModule { }
```

Para que la aplicación reconozca la configuración debemos aplicar este cambio en el archivo `main.ts`, por defecto NestJS convierte a un número el puerto que recibe:

```ts
import { ConfigService } from '@nestjs/config'
...

async function bootstrap () {
    const app = await NestFactory.create( AppModule )
    const configService = app.get( ConfigService )
    await app.listen( configService.get( 'PORT' ) )
}
```

Vamos a instalar Morgan para observar los logs de la aplicación, por lo que usamos los siguientes comandos:

```txt
pnpm i -S morgan
```

```txt
pnpm i -D @types/morgan
```

En el archivo `main.ts` definimos que nuestra app use morgan en modo desarrollo:

```ts
import * as morgan from morgan
...
async function bootstrap () {
    ...
    app.use( morgan( 'dev' ) )
    ...
}
```

Podemos definir un prefijo global de las endpoints de la siguiente manera:

```ts
async function bootstrap () {
    ...
    app.setGlobalPrefix( 'api' )
    ...
}
```

Otra configuración de la app son los CORS (Cross Origin Resources Sharing o Intercambio de Recursos de Origin Cruzado), por lo que creamos una constante indicando que métodos HTTP debe usar, y si debe o no usar credenciales en cada petición:

```ts
import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface"

export const CORS: CorsOptions = {
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true
}
```

```ts
import { CORS } from './constants'
...
async function bootstrap () {
    ...
    app.enableCors( CORS )
    ...
}
```

Podemos mostrar la url y puerto por donde corre la aplicación usando el método asíncrono `getUrl()`:

```ts
async function bootstrap () {
    ...
    console.log( `Application running on: ${ await app.getUrl() }` )
}
```

___

| Anterior                                               | Readme                 | Siguiente                                                           |
| ------------------------------------------------------ | ---------------------- | ------------------------------------------------------------------- |
| [Introducción a NestJS](./P1T1_Introduccion_NestJS.md) | [Readme](../README.md) | [Docker Compose y ¨PostgreSQL](./P3T1_Docker_Compose_PostgreSQL.md) |
