# Módulo HTTP + Axios

Vamos a crear un módulo para realizar peticiones HTTP desde nuestro backend hacia la API de Rick & Morty. Lo primero será realizar la instalación de Axios:

```txt
$: pnpm i -S @nestjs/axios axios
```

Ahora generamos un nuevo módulo llamado `providers` con el siguiente comando:

```txt
$: nest g mo providers --no-spec
```

En este caso vamos a retirar la importación global dentro del archivo `app.module.ts`, ya que implementaremos el módulo de manera especifica en algunos lugares. También vamos a crear un servicio con el siguiente comando:

```txt
$: nest g s providers/http/http-custom --flat --no-spec
```

Ahora, configuramos el nuevo módulo para importar el módulo de HTTP y exportar el servicio recién creado.

```ts
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { HttpCustomService } from './http/http-custom.service';

@Module( {
    imports: [ HttpModule ],
    providers: [ HttpCustomService ],
    exports: [ HttpCustomService ]
} )
export class ProvidersModule { }
```

En el servicio inyectamos `HttpService`, y creamos un método que hará uso de un observable para retornar la data de la petición que se realiza a la api de Rick & Morty:

```ts
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ErrorManager } from 'src/utils/error.manager';

@Injectable()
export class HttpCustomService {
    constructor ( private readonly _httpService: HttpService ) { }

    async apiFindAll () {
        try {
            const response = await firstValueFrom(
                this._httpService.get( 'https://rickandmortyapi.com/api/character' )
            );

            return response.data;
        } catch ( error ) {
            throw ErrorManager.createSignatureError( error.message );
        }
    }
}
```

Importaremos el módulo de providers dentro del módulo de usuarios:

```ts
@Module( {
    imports: [
        ...,
        ProvidersModule
    ],
    ...
} )
export class UsersModule { }
```

Y ahora usamos el método del servicio dentro del controlador de proyectos:

```ts
export class UsersController {
    constructor ( ..., private readonly _httpCustomService: HttpCustomService ) { }

    @PublicAccess()
    @Get( 'rick-and-morty' )
    public async apiFindAllCharacters () {
        return await this._httpCustomService.apiFindAll();
    }
    ...
}
```

Cuando hacemos la petición, nuestro módulo funciona correctamente.

___

| Anterior               | Readme                 | Siguiente              |
| ---------------------- | ---------------------- | ---------------------- |
| [Documentación con Swagger y OpenAPI](./P13T1_Documentacion_Swagger_OpenAPI.md) | [Readme](../README.md) |  |
