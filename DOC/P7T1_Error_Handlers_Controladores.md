# Error Handlers y Controladores

Vamos a crear un directorio llamado `/utils` dentro del cual tendremos un archivo llamado `error.manager.ts` en donde crearemos una clase para manejar los errores de respuesta. La instancia de esta clase debe recibir como parámetro un objeto con el tipo y mensaje del error, el primero debe ser de los tipos disponibles en el enum `HttpStatus` ofrecido por NestJS. Luego creamos un método estático que arroja el error en base al mensaje que se recibe:

```ts
import { HttpException, HttpStatus } from "@nestjs/common"

export class ErrorManager extends Error {
    constructor ( { type, message }: { type: keyof typeof HttpStatus, message: string } ) {
        super( `${ type } :: ${ message }` )
    }

    public static createSignatureError ( message: string ) {
        const name = message.split( " :: " ).at( 0 )

        if ( name ) throw new HttpException( message, HttpStatus[ name ] )
        else throw new HttpException( message, HttpStatus.INTERNAL_SERVER_ERROR )
    }
}
```

Dentro del archivo de servicios vamos a personalizar las líneas en donde lanzamos error. Por ejemplo para el caso de encontrar usuarios, si no encuentra ningún registro define el error con el tipo y el mensaje, posteriormente, dentro del `catch` crea la firma del error que se debe arrojar:

```ts
export class UsersService {
    ...
    public async findUsers (): Promise<UserEntity[]> {
        try {
            const users: UserEntity[] = await this._userRepository.find()
            if ( !users.length ) {
                throw new ErrorManager( {
                    type: 'BAD_REQUEST',
                    message: 'No se encontraron resultados'
                } )
            }
            return users
        } catch ( error ) {
            throw ErrorManager.createSignatureError( error.message )
        }
    }
}
```

Aplicamos la misma estructura para los demás métodos tanto en los servicios de usuarios como en los proyectos. Lo siguiente es comenzar a crear los métodos dentro de los controladores, por ejemplo para el registro de usuarios:

```ts

@Controller( 'users' )
export class UsersController {
    constructor ( private readonly _usersService: UsersService ) { }

    @Post( 'register' )
    public async registerUser ( @Body() body: UserDTO ) {
        return await this._usersService.createUser( body )
    }
}
```

Dentro de un API cliente realizamos la consulta al endpoint `localhost:8000/api/users/register` con el verbo POST y los siguientes datos en el body:

```json
{
    "firstName": "User",
    "lastName": "Admin",
    "age": "18",
    "email": "user@admin.com",
    "username": "user-admin",
    "password": "secret123",
    "role": "ADMIN"
}
```

Cuando necesitamos obtener un parámetro de un endpoint tenemos 2 maneras de obtenerlo: El primero es crear un tipo y aplicar desestructuración, y la segunda manera y más simple es haciendo uso de una prop dentro del decorador de `@Param()`:

```ts
import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
...

@Controller( 'users' )
export class UsersController {
    ...
    @Get( ':id' )
    public async findUserById ( @Param() { id }: { id: string } ) {
        return await this._usersService.findUserById( id )
    }

    @Put( 'edit/:id' )
    public async updateUser ( @Param( 'id' ) id: string, @Body() body: UserUpdateDTO ) {
        return await this._usersService.updateUser( id, body )
    }
    ...
}

```

___

| Anterior | Readme | Siguiente |
| -------- | ------ | --------- |
| [Iniciando con TypeORM](./P4T1_Iniciando_con_TypeORM.md) | [Readme](../README.md) | |
