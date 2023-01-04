# Iniciando con TypeORM

Vamos a hacer la integración con TypeORM por lo que usamos el siguiente comando para instalar su módulo en nest, el propio paquete de TypeORM, el cliente de postgres, y las estrategias de nombrado:

```txt
pnpm i -S @nestjs/typeorm typeorm pg typeorm-naming-strategies
```

Iniciamos configurando la conexión a la base de datos que se encuentra el contenedor de docker, y lo haremos en el archivo `config/data.source.ts`. Para simplificar el trabajo usamos de nuevo el `ConfigModule` con el fin de extraer las variables de entorno:

```ts
import { ConfigModule, ConfigService } from '@nestjs/config'

ConfigModule.forRoot( {
    envFilePath: [ `.${ process.env.NODE_ENV }.env`, '.env' ]
} )

const configService = new ConfigService()
```

Lo siguiente es configurar el pool de conexión y definir una instancia de la conexión:

```ts
import { DataSource, DataSourceOptions } from "typeorm"
import { SnakeNamingStrategy } from "typeorm-naming-strategies"
...
export const DataSourceConfig: DataSourceOptions = {
    type: 'postgres',
    host: configService.get( `DB_HOST` ),
    port: Number( configService.get( `DB_PORT` ) ),
    username: configService.get( `DB_USER` ),
    password: configService.get( `DB_PASSWORD` ),
    database: configService.get( `DB_NAME` ),
    entities: [ __dirname + '/../**/**/*.entity{.ts,.js}' ],
    migrations: [ __dirname + '/../../migrations/*{.ts,.js}' ],
    synchronize: false,
    migrationsRun: true,
    logging: false,
    namingStrategy: new SnakeNamingStrategy()
}

export const AppDataSource = new DataSource( DataSourceConfig )
```

Dentro del módulo `AppModule` configuramos la implementación de `TypeOrmModule` con las opciones definidas anteriormente:

```ts
...
import { TypeOrmModule } from '@nestjs/typeorm'
import { DataSourceConfig } from './config/data.source'

@Module( {
    imports: [
        ...,
        TypeOrmModule.forRoot( { ...DataSourceConfig } ),
        ...
    ],
} )
export class AppModule { }
```

Es importante que en todos los archivos que declaremos en la propiedad `envFilePath` del `ConfigModule`, se implementen las variables que vayamos a usar a través del proyecto.

```.env
DB_HOST = 'localhost'
DB_PORT = 5435
DB_USER = 'user_nest'
DB_PASSWORD = 'secret1234'
DB_NAME = 'nestdb'
```

Generamos un nuevo módulo con el comando a continuación, que dedicaremos a la sección de proyectos:

```txt
nest g mo projects
```

Primero vamos a crear una clase abstracta que nos ayudara a definir propiedades en común de todas las entidades, a dicha clase la llamaremos `BaseEntity` y se encuentra en `config/base.entity.ts` (Es importante que al momento de importarla no la confundamos con la provista por TypeORM):

```ts
import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"


export abstract class BaseEntity {
    @PrimaryGeneratedColumn( 'uuid' )
    id: string

    @CreateDateColumn( {
        type: 'timestamp',
        name: 'created_at'
    } )
    createAt: Date

    @UpdateDateColumn( {
        type: 'timestamp',
        name: 'updated_at'
    } )
    updatedAt: Date
}
```

Lo siguiente es definir las interfaces que se implementaran para nuestras entidades:

```ts
export interface IUser {
    firstName: string
    lastName: string
    age: number
    email: string
    username: string
    password: string
    role: string
}
```

```ts
export interface IProject {
    name: string
    description: string
}
```

Ahora, pasamos a crear las entidades de cada módulo, recordando que deben heredar de nuestra clase `BaseEntity` e implementar sus respectivas interfaces:

```ts
import { IUser } from "src/interface/user.interface"
import { Column, Entity } from "typeorm"
import { BaseEntity } from '../../config/base.entity'

@Entity( { name: 'users' } )
export class UserEntity extends BaseEntity implements IUser {
    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column()
    age: number

    @Column()
    email: string

    @Column()
    username: string

    @Column()
    password: string

    @Column()
    role: string
}
```

```ts
import { BaseEntity } from "src/config/base.entity"
import { IProject } from "src/interface/project.interface"
import { Column, Entity } from "typeorm"


@Entity( { name: 'projects' } )
export class ProjectsEntity extends BaseEntity implements IProject {
    @Column()
    name: string

    @Column()
    description: string
}
```

En próximas clases haremos un poco más extensas las propiedades de cada entidad.

___

| Anterior                                                            | Readme                 | Siguiente                                                                                        |
| ------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------ |
| [Docker Compose y ¨PostgreSQL](./P3T1_Docker_Compose_PostgreSQL.md) | [Readme](../README.md) | [Relación custom Many to Many y Migraciones](./P5T1_Relacion_Custom_Many_to_Many_Migraciones.md) |
