# Autorización con Guards y Decoradores

Antes de iniciar con esta lección, vamos a reconocer el uso de la información del usuario que se envía en el endpoint de login, ya que podría parecer innecesaria, pero resulta muy útil para mantener la información en el lado del cliente, sin que tenga que hacer una consulta nueva a la base de datos. Mientras tanto, el token va a contener los permisos que tiene el usuario.

Iniciaremos con dos interfaces dentro del módulo de autenticación:

```ts
export interface IAuthTokenResult {
    role: string
    sub: string
    iat: string
    exp: string
    isExpired: boolean
}

export interface IUseToken {
    role: string
    sub: string
    isExpired: boolean
}
```

Creamos un nuevo método auxiliar, que nos permita retornar si un token ha expirado o no, en donde decodificamos el token, y retornamos un objeto con las propiedades definidas en la interfaz `IUseToken`, en donde `isExpired` es una operación booleana entre la fecha actual y la fecha de expiración del token:

```ts
import { IUseToken } from "src/auth/interfaces/auth.interface"
import * as jwt from 'jsonwebtoken'
import { IAuthTokenResult } from '../auth/interfaces/auth.interface'


export const useToken = ( token: string ): IUseToken | string => {
    try {
        const decode = jwt.decode( token ) as unknown as IAuthTokenResult

        const currentDate = new Date()
        const expiresDate = new Date( decode.exp )

        return {
            sub: decode.sub,
            role: decode.role,
            isExpired: +expiresDate <= +currentDate / 1000
        }
    } catch ( error ) {
        return 'Token is invalid'
    }
}
```

Los Guards son clases que nos permiten ejecutar o no una función a partir de observadores. Para generar un nuevo decorador usamos el siguiente comando:

```txt
$: nest g gu auth/guards/auth --flat --no-spec
```

Dentro de la nueva clase realizamos la inyección de nuestro `UserService` y la clase `Reflector`, la cual nos permite leer o reflejar la metadata almacenada.

```ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Observable } from 'rxjs'
import { UsersService } from '../../users/services/users.service'
import { Reflector } from '@nestjs/core'

@Injectable()
export class AuthGuard implements CanActivate {
    constructor (
        private readonly _userService: UsersService,
        private readonly _reflector: Reflector
    ) { }

    canActivate ( context: ExecutionContext ): boolean | Promise<boolean> | Observable<boolean> {
        return true
    }
}
```

Ahora crearemos un decorador personalizado con el siguiente comando:

```txt
$: nest g d auth/decorators/public-access --flat --no-spec
```

En este decorador vamos setear la metadata bajo la llave con nombre `PUBLIC` (string que se exporta como constante), y el valor de la metadata será `true`. Este decorador tiene como objetivo hacer públicos los endpoints a los cuales se le asigne la función decoradora.

```ts
import { SetMetadata } from '@nestjs/common'
import { PUBLIC_KEY } from 'src/constants/key-decorators'

export const PublicAccess = () => SetMetadata( PUBLIC_KEY, true )
```

Antes de ir al guardian, vamos a definir a extender el tipado para express, con la intención de tener 2 propiedades disponibles. Esto lo hacemos en el archivo `types/express/index.d.ts`:

```ts
declare namespace Express {
    interface Request {
        idUser: string
        roleUser: string
    }
}
```

Dentro del guard de autenticación necesitamos que el método `canActivate` sea asíncrono para poder hacer una petición a nuestro servicio de usuarios. Dentro de dicho método vamos a evaluar si la metadata reflejada contiene la key `PUBLIC`, en cuyo caso permitirá el libre uso del endpoint.

Si no existe la metadata anterior, entonces obtenemos las propiedades de la petición, dentro la cual asumiremos que nos han enviado el token mediante los header es una clave llamada `user-token`. En caso de que no exista el token o que sea de tipo Array, devolveremos un status 401 por token invalido.

Si pasa la validación usaremos nuestra función `useToken` para validar el token compartido. En caso de que el token no se pueda decodificar y por lo tanto nuestra función retorne un string, o que el token ya haya vencido, retornamos un status 401.

Lo siguiente será buscar el usuario por su id mediante la propiedad `sub` que se extrae del token decodificado. Si el usuario no existe, volvemos a retornar el status 401, pero en caso de que exista, asignaremos las propiedades de id y role, a la extendidas dentro de la request de Express y retornamos `true` para dar paso al uso del endpoint.

```ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Request } from 'express'
import { PUBLIC_KEY } from '../../constants/key-decorators'
import { UsersService } from '../../users/services/users.service'
import { useToken } from '../../utils/use.token'
import { IUseToken } from '../interfaces/auth.interface'

@Injectable()
export class AuthGuard implements CanActivate {
    constructor (
        private readonly _userService: UsersService,
        private readonly _reflector: Reflector
    ) { }

    async canActivate ( context: ExecutionContext ) {
        const isPublic = this._reflector.get<boolean>( PUBLIC_KEY, context.getHandler() )

        if ( isPublic ) return true

        const req = context.switchToHttp().getRequest<Request>()
        const token = req.headers[ 'user-token' ]

        if ( !token || Array.isArray( token ) ) throw new UnauthorizedException( 'Invalid token' )

        const manageToken: IUseToken | string = useToken( token )

        if ( typeof manageToken === 'string' ) throw new UnauthorizedException( manageToken )
        if ( manageToken.isExpired ) throw new UnauthorizedException( 'Token expired' )

        const { sub } = manageToken
        const user = await this._userService.findUserById( sub )

        if ( !user ) throw new UnauthorizedException( 'Invalid User' )

        req.idUser = user.id
        req.roleUser = user.role

        return true
    }
}
```

¿Cómo usamos todo lo anterior? Dentro del controlador de usuarios vamos a hacer pública el endpoint para consultar un usuario por su id, para lo cual debemos usar nuestro decorador `@PublicAccess()`, y del decorador a nivel de clase `@UseGuards()` para indicarle que use nuestro guard `AuthGuard`:

```ts
import { ..., UseGuards } from '@nestjs/common'
import { PublicAccess } from 'src/auth/decorators/public-access.decorator'
import { AuthGuard } from 'src/auth/guards/auth.guard'
...

@Controller( 'users' )
@UseGuards( AuthGuard )
export class UsersController {
    ...
    @PublicAccess()
    @Get( ':id' )
    public async findUserById ( ... ): Promise<UserEntity> { ... }
}
```

Cuando hacemos una petición a `http://localhost:8000/api/users/:id` no necesitamos de ningún token para hacer la petición, pero cuando realizamos una solicitud a cualquiera de los otros endpoints, nos veremos obligados a enviar un token mediante los headers con el nombre de `user-token`.

También podemos usar propiedad `Authorization` de los headers con el objetivo de tener un estándar común con otras APIs, con esto en mente actualizamos el guard:

```ts
@Injectable()
export class AuthGuard implements CanActivate {
    ...
    async canActivate ( context: ExecutionContext ) {
        ...
        const req = context.switchToHttp().getRequest<Request>()
        const token = req.headers.authorization
        ...
    }
}
```

___

| Anterior               | Readme                 | Siguiente              |
| ---------------------- | ---------------------- | ---------------------- |
| [Autenticación de usuarios](./P9T1_Autenticacion_Usuarios.md) | [Readme](../README.md) | [Manejo de Roles y niveles de acceso](./P11T1_Manejo_roles_niveles_acceso.md) |
