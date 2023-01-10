# DTOs, Patron repositorio y Servicios

Un DTO es un Objeto de Transferencia de Datos o Data Transfer Object, el cual nos permite determinar las propiedades que necesitamos en la petición HTTP. Lo primero que necesitamos en esta lección es instalar 2 paquetes con el siguiente comando:

```txt
pnpm i -S class-validator class-transformer
```

En el archivo `main.ts` necesitamos añadir la configuración de pipes de validación que nos permitan el uso de los DTO:

```ts
...
import { ValidationPipe } from '@nestjs/common'

async function bootstrap () {
    ...
    app.useGlobalPipes( new ValidationPipe( {
        transformOptions: {
            enableImplicitConversion: true
        }
    } ) )
    ...
}
```

Procedemos a crear un DTO para la entidad de los usuarios, definimos cuales son obligatorios y de que tipo:

```ts
import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { IUser } from '../../interface/user.interface'
import { ROLES } from '../../constants'


export class UserDTO implements IUser {
    @IsNotEmpty()
    @IsString()
    firstName: string

    @IsNotEmpty()
    @IsString()
    lastName: string

    @IsNotEmpty()
    @IsNumber()
    age: number

    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string

    @IsNotEmpty()
    @IsString()
    username: string

    @IsNotEmpty()
    @IsString()
    password: string

    @IsNotEmpty()
    @IsEnum( ROLES )
    role: ROLES
}
```

También creamos un DTO para cuando actualizamos la entidad, en donde todas las propiedades son opcionales, permitiéndonos actualizar de manera parcial un registro:

```ts
export class UserUpdateDTO implements Partial<IUser> {
    @IsOptional()
    @IsString()
    firstName?: string

    @IsOptional()
    @IsString()
    lastName?: string

    @IsOptional()
    @IsNumber()
    age?: number

    @IsOptional()
    @IsString()
    @IsEmail()
    email?: string

    @IsOptional()
    @IsString()
    username?: string

    @IsOptional()
    @IsString()
    password?: string

    @IsOptional()
    @IsEnum( ROLES )
    role?: ROLES
}
```

Luego dentro del servicio para usuarios hacemos la inyección de un repositorio, en este caso la entidad de usuarios:

```ts
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserEntity } from '../entities/user.entity'


@Injectable()
export class UsersService {
    constructor ( @InjectRepository( UserEntity ) private readonly _userRepository: Repository<UserEntity> ) { }
}
```

Es importante que dentro del módulo de usuarios importemos la configuración por característica del módulo de TypeOrm con el fin de añadir las entidades relacionadas:

```ts
...
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserEntity } from './entities/user.entity'

@Module( {
    imports: [
        TypeOrmModule.forFeature( [ UserEntity ] )
    ],
    ...
} )
export class UsersModule { }
```

Ahora podemos crear los métodos CRUD básicos dentro del servicio de usuarios:

```ts
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeleteResult, Repository, UpdateResult } from 'typeorm'
import { UserDTO, UserUpdateDTO } from '../dtos/user.dto'
import { UserEntity } from '../entities/user.entity'


@Injectable()
export class UsersService {
    constructor ( @InjectRepository( UserEntity ) private readonly _userRepository: Repository<UserEntity> ) { }

    public async findUsers (): Promise<UserEntity[]> {
        try {
            return await this._userRepository.find()
        } catch ( error ) {
            throw new Error( error )
        }
    }

    public async findUserById ( id: string ): Promise<UserEntity> {
        try {
            return await this._userRepository
                .createQueryBuilder( 'user' )
                .where( { id } )
                .getOne()
        } catch ( error ) {
            throw new Error( error )
        }
    }

    public async createUser ( body: UserDTO ): Promise<UserEntity> {
        try {
            return await this._userRepository.save( body )
        } catch ( error ) {
            throw new Error( error )
        }
    }

    public async updateUser ( id: string, body: UserUpdateDTO ): Promise<UpdateResult | null> {
        try {
            const result: UpdateResult = await this._userRepository.update( id, body )
            return ( !result.affected )
                ? null
                : result
        } catch ( error ) {
            throw new Error( error )
        }
    }

    public async deleteUser ( id: string ): Promise<DeleteResult | null> {
        try {
            const result: DeleteResult = await this._userRepository.delete( id )
            return ( !result.affected )
                ? null
                : result
        } catch ( error ) {
            throw new Error( error )
        }
    }
}
```

Todo lo anterior lo aplicamos dentro del módulo de proyectos, recordando los comandos:

```txt
nest g s projects/services/projects --flat
```

```txt
nest g co projects/controllers/projects --flat
```

___

| Anterior                                                                                         | Readme                 | Siguiente |
| ------------------------------------------------------------------------------------------------ | ---------------------- | --------- |
| [Relación custom Many to Many y Migraciones](./P5T1_Relacion_Custom_Many_to_Many_Migraciones.md) | [Readme](../README.md) | [Error Handlers y Controladores](./P7T1_Error_Handlers_Controladores.md) |
