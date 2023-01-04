# Relación custom Many to Many y Migraciones

Una actualización con respecto a la lección anterior, es respecto a 2 propiedades de la entidad de usuarios, en donde queremos que el email y el username sean registros únicos:

```ts
export class UserEntity extends BaseEntity implements IUser {
    ...
    @Column( { unique: true } )
    email: string

    @Column( { unique: true } )
    username: string
    ...
}
```

Vamos a crear 2 enum para los roles y para el nivel de acceso de los mismos, estos los creamos en la carpeta de constantes y los exportamos en el archivo barril:

```ts
export enum ROLES {
    BASIC = 'BASIC',
    ADMIN = 'ADMIN'
}

export enum ACCESS_LEVEL {
    MAINTAINER = 40,
    OWNER = 50
}
```

El primer enum lo usaremos dentro de la entidad de usuario en la propiedad de rol:

```ts
@Entity( { name: 'users' } )
export class UserEntity extends BaseEntity implements IUser {
    ...
    @Column( {
        type: 'enum',
        enum: ROLES
    } )
    role: ROLES
}
```

Ahora vamos a crear una entidad que servirá como entidad de pivot o normalización de la relación Many to Many entre los usuarios y los proyectos:

```ts
import { BaseEntity } from "src/config/base.entity"
import { ACCESS_LEVEL } from "src/constants"
import { ProjectEntity } from "src/projects/entities/project.entity"
import { Column, Entity, ManyToOne } from "typeorm"
import { UserEntity } from "./user.entity"


@Entity( { name: 'users_projects' } )
export class UsersProjectsEntity extends BaseEntity {
    @Column( {
        type: 'enum',
        enum: ACCESS_LEVEL
    } )
    accessLevel: ACCESS_LEVEL

    @ManyToOne( () => UserEntity, ( user ) => user.projectsIncludes )
    user: UserEntity

    @ManyToOne( () => ProjectEntity, ( project ) => project.usersIncludes )
    project: ProjectEntity
}
```

Como vemos en las relaciones, necesitamos crear una propiedad nueva en cada clase que sea de tipo arreglo de entidad pivot (`UsersProjectsEntity[]`), con el fin de indicar la relación entre tablas:

```ts
import { ..., OneToMany } from "typeorm"

export class UserEntity extends BaseEntity implements IUser {
    ...
    @OneToMany( () => UsersProjectsEntity, ( userProject ) => userProject.user )
    projectsIncludes: UsersProjectsEntity[]
}
```

```ts
import { ..., OneToMany } from "typeorm"

@Entity( { name: 'projects' } )
export class ProjectEntity extends BaseEntity implements IProject {
    ...
    @OneToMany( () => UsersProjectsEntity, ( userProject ) => userProject.project )
    usersIncludes: UsersProjectsEntity[]
}
```

Ahora necesitamos los scripts para generar y correr una migración hacia la base de datos, por lo que dentro del `package.json` añadimos los siguientes comandos (para evitar problemas con el reconocimiento de la variable de entorno, dejamos que el valor no tenga espacio en ningún lado):

```json
{
    "scripts": {
        ...,
        "orm:init": "typeorm-ts-node-esm -d ./src/config/data.source.ts",
        "m:gen": "SET NODE_ENV=dev&& npm run orm:init migration:generate",
        "m:run": "SET NODE_ENV=dev&& npm run orm:init migration:run",
        ...
    }
}
```

Para generar una migración corremos el siguiente comando:

```txt
pnpm m:gen -- src/migrations/<nombre de la migración>
```

Para correr la migración usamos el comando:

```txt
pnpm m:run
```

Cuando ejecutamos el comando para la generación de la migración se muestra un error por que no reconoce las ubicaciones. Esto se debe a que nuestro archivos están haciendo importaciones con ruta relativa al `src` de la siguiente manera:

```ts
import { BaseEntity } from "src/config/base.entity"
```

Necesitamos cambiarlas a la ruta definitiva de la siguiente manera:

```ts
import { BaseEntity } from "../../config/base.entity"
```

Si volvemos a ejecutar el comando para generar la migración, se crear un archivo dentro de la carpeta `migrations` con las sentencias que se han de ejecutar dentro de la base de datos, las cuales corremos con el comando `pnpm m:run`.

Dentro del archivo `tsconfig.build.json` podemos añadir la configuración para que excluya la carpeta de migraciones dentro del paquete `dist` que se crea al momento de correr el proyecto:

```json
{
    ...,
    "exclude": [
        ...,
        "src/migrations"
    ]
}
```

Cuando observamos la estructura de nuestra base de datos podemos observar que se han creado 4 tablas: projects, users, users_projects y migrations, lo cual significa que todo ha ido bien.

___

| Anterior                                                 | Readme                 | Siguiente                                                                         |
| -------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------- |
| [Iniciando con TypeORM](./P4T1_Iniciando_con_TypeORM.md) | [Readme](../README.md) | [DTOs, Patron repositorio y Servicios](P6T1_DTOS_Patron_Repositorio_Servicios.md) |
