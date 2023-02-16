# Autenticación de Usuarios + Tip de TypeScript

## TIP

Vamos primero con el tip. Creamos un archivo de declaración llamado `types/index.d.ts` con el objetivo de declarar las variables de entorno y lograr que el intellisense reconozca nuestras variables de entorno:

```ts
declare namespace NodeJS {
    interface ProcessEnv {
        PORT: number
        DB_HOST: string
        DB_PORT: number
        DB_USER: string
        DB_PASSWORD: string
        DB_NAME: string
    }
}
```

De esta manera, cada que usemos `process.env.` podremos acceder a todas nuestras variables de entorno y no solo las del sistema. Recordar que esta estrategia se puede aplicar en muchos otros aspectos.

## Autenticación

Para la autenticación vamos a cifrar la contraseña del usuario y generarle un token de acceso, para ello instalamos 2 librerías:

```txt
$: pnpm i bcrypt jsonwebtoken @types/bcrypt @types/jsonwebtoken
```

Lo primero será cifrar la contraseña que viene del body en el método del servicio:

```ts
@Injectable()
export class UsersService {
    ...
    public async createUser ( body: UserDTO ): Promise<UserEntity> {
        try {
            body.password = await bcrypt.hash(
                body.password,
                process.env.HASH_SALT
            )
            ...
        } catch ( error ) { ... }
    }
    ...
}
```

La variable `HASH_SALT` se refiere a agregar datos aleatorios a la entrada de una función para garantizar una salida única, el hash, incluso cuando las entradas son las mismas. En la protección por contraseña, salt es una cadena de datos aleatorios que se utilizar para modificar un hash de contraseña. Esta variable ha sido guardada dentro de las variables de entorno.

Cuando creamos el usuario, no queremos retornar la contraseña del mismo al momento de darle una respuesta, por lo tanto podemos excluirla de la siguiente manera:

```ts
@Injectable()
export class UsersService {
    ...
    public async createUser ( body: UserDTO ): Promise<UserEntity> {
        try {
            ...
            delete user.password
            return user
        } catch ( error ) { ... }
    }
    ...
}
```

La mejor manera es usar un decorador del paquete `class-transformer` dentro de la definición de la entidad, con el fin de que se excluya de todas las consultas:

```ts
import { Exclude } from 'class-transformer'
...
export class UserEntity extends BaseEntity implements IUser {
    ...
    @Exclude()
    @Column()
    password: string
    ...
}
```

Pero para que reconozca esta validación necesitamos realizar un cambio dentro del archivo main:

```ts
import { ClassSerializerInterceptor, ... } from '@nestjs/common'
import { ..., Reflector } from '@nestjs/core'
...
async function bootstrap () {
    ...
    const reflector = app.get( Reflector )
    app.useGlobalInterceptors( new ClassSerializerInterceptor(reflector) )
    ...
}
```

Ahora creamos un nuevo módulo para la autenticación pura, y para esta ocasión generaremos un resource:

```txt
$: nest g res auth --no-spec
? What transport layer do you use? REST API
? Would you like to generate CRUD entry points? No
CREATE src/auth/auth.controller.ts (204 bytes)
CREATE src/auth/auth.module.ts (240 bytes)
CREATE src/auth/auth.service.ts (88 bytes)
UPDATE package.json (2865 bytes)
UPDATE src/app.module.ts (699 bytes)
```

Vamos a declarar el módulo de autenticación, como un módulo global, con el fin de poder usar libremente sus clases en cualquier otro módulo:

```ts
import { Global, Module } from '@nestjs/common'
...
@Global()
@Module( { ... } )
export class AuthModule { }
```

Dentro del servicio crearemos algunas funciones, pero antes necesitamos importar el módulo de usuarios dentro del módulo de autenticación:

```ts
import { UsersModule } from './../users/users.module'
...
@Global()
@Module( {
    imports: [ UsersModule ],
    ...
} )
export class AuthModule { }
```

Pero como no necesitamos todo el contenido del módulo de usuarios, exportaremos solo el servicio:

```ts
@Module( {
    ...,
    exports: [ UsersService ]
} )
export class UsersModule { }
```

Antes de avanzar, vamos a crear un nuevo método dentro del servicio de usuarios, con el fin de buscarlos por x propiedad que este definida dentro del DTO de usuarios:

```ts
@Injectable()
export class UsersService {
    ...
    public async findBy ( { key, value }: { key: keyof UserDTO, value: any } ) {
        try {
            const user: UserEntity = await this._userRepository
                .createQueryBuilder( 'user' )
                .addSelect( 'user.password' )
                .where( { [ key ]: value } )
                .getOne()
            return user
        } catch ( error ) {
            throw ErrorManager.createSignatureError( error.message )
        }
    }
    ...
}
```

Ahora, dentro del servicio de autenticación validamos al usuario por su username/email y contraseña:

```ts
import * as bcrypt from 'bcrypt'
...
@Injectable()
export class AuthService {
    constructor ( private _userService: UsersService ) { }

    private async _validateUser ( username: string, password: string ) {
        const userByUsername = await this._userService.findBy( { key: 'username', value: username } )

        if ( userByUsername ) {
            const match = await bcrypt.compare( password, userByUsername.password )
            if ( match ) return userByUsername
        }

        const userByEmail = await this._userService.findBy( { key: 'email', value: password } )

        if ( userByEmail ) {
            const match = await bcrypt.compare( password, userByEmail.password )
            if ( match ) return userByEmail
        }
    }
}
```

Creamos otro método en el servicio, que se encargue de recolectar la data con la que se debe firmar el token:

```ts
import * as jwt from 'jsonwebtoken'
import { ..., ISignJWT } from './interfaces/auth.interface'
...
@Injectable()
export class AuthService {
    ...
    private async _signJWT ( { payload, secret, expiresIn }: ISignJWT ) {
        return await jwt.sign( payload, secret, { expiresIn } )
    }
    ...
}
```

Establecemos un tercer método para generar el token usando la información del usuario validado, retornando el JWT firmado y acompañado de la información del usuario.

```ts
import { ..., IPayloadToken, ITokenResponse } from './interfaces/auth.interface'

@Injectable()
export class AuthService {
    ...
    private async _generateJWT ( user: UserEntity ): Promise<ITokenResponse> {
        const payload: IPayloadToken = {
            role: user.role,
            sub: user.id
        }

        delete user.password

        return {
            accessToken: await this._signJWT( {
                payload,
                secret: process.env.JWT_SECRET,
                expiresIn: '1h'
            } ),
            user
        }
    }
}
```

El último método es usado para validar el usuario, generar su token y retornarlo, esta función es la combinación de todos los demás métodos del servicio y se usar para el ingreso del usuario.

```ts
import { ..., UnauthorizedException } from '@nestjs/common'
import { IAuthBody, ... } from './interfaces/auth.interface'
...
@Injectable()
export class AuthService {
    ...
    public async login ( { username, password }: IAuthBody ) {
        const userValidate = await this._validateUser( username, password )

        if ( !userValidate )
            throw new UnauthorizedException( 'Data not valid' )

        const jwt = await this._generateJWT( userValidate )

        return jwt
    }
    ...
}
```

Ahora, dentro del controlador llamamos el método en un endpoint con el verbo POST:

```ts
import { Body, Controller, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { IAuthBody } from './interfaces/auth.interface'

@Controller( 'auth' )
export class AuthController {
    constructor ( private readonly authService: AuthService ) { }

    @Post( 'login' )
    async login ( @Body() body: IAuthBody ) {
        return await this.authService.login( body )
    }
}
```

Para validar de una mejor manera los campos del body, podemos usar un DTO y reemplazar la interfaz `IAuthBody` en los diferentes métodos:

```ts
import { IsNotEmpty, IsString } from 'class-validator'
import { IAuthBody } from "../interfaces/auth.interface"

export class AuthDTO implements IAuthBody {
    @IsNotEmpty()
    @IsString()
    username: string

    @IsNotEmpty()
    @IsString()
    password: string
}
```

___

| Anterior               | Readme                 | Siguiente              |
| ---------------------- | ---------------------- | ---------------------- |
| [Relaciones con Query Builder](./P8T1_Relaciones_Query_Builder.md) | [Readme](../README.md) |  |
