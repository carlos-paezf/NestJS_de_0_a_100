# Relaciones con Query Builder

Vamos a publicar un endpoint que nos permita cargar la relación de usuarios con proyectos, y su determinado nivel de acceso. Lo primero que haremos será crear una clase DTO para validar el body de la petición:

```ts
export class UserToProjectDTO {
    @IsNotEmpty()
    @IsUUID()
    user: UserEntity

    @IsNotEmpty()
    @IsUUID()
    project: ProjectEntity

    @IsNotEmpty()
    @IsEnum( ACCESS_LEVEL )
    accessLevel: ACCESS_LEVEL
}
```

Dentro del módulo de usuarios declaramos la entidad `UsersProjectsEntity` en la configuración de TypeOrmModule para que se cree una tabla con la misma:

```ts
@Module( {
    imports: [
        TypeOrmModule.forFeature( [
            UserEntity, UsersProjectsEntity
        ] )
    ],
    ...,
} )
export class UsersModule { }
```

Seguimos con la creación de un método dentro del servicio de usuarios, para añadir un usuario a un proyecto. En este paso debemos inyectar el repositorio de `UsersProjectsEntity` con el objetivo de poder hacer peticiones a la nueva tabla:

```ts
@Injectable()
export class UsersService {
    constructor (
        ...,
        @InjectRepository( UsersProjectsEntity ) private readonly _usersProjectsRepository: Repository<UsersProjectsEntity>
    ) { }
    ...
    public async relationToProject ( body: UserToProjectDTO ) {
        try {
            return await this._usersProjectsRepository.save( body )
        } catch ( error ) {
            throw ErrorManager.createSignatureError( error.message )
        }
    }
}
```

En el controlador creamos el método que se encargue de recibir el body del endpoint y enviarlo al servicio:

```ts
@Controller( 'users' )
export class UsersController {
    ...
    @Post( 'user-to-project' )
    public async addToProject ( @Body() body: UserToProjectDTO ) {
        return await this._usersService.relationToProject( body )
    }
}
```

Ahora podemos usar el endpoint `http://localhost:8000/api/users/user-to-project/` y enviarle una petición POST con un body como por ejemplo:

```json
{
    "user": "7050d082-b91c-4fe7-aa75-4b61250cfec6",
    "project": "05bab1c5-adcd-462b-8b67-4ea9735300a0",
    "accessLevel": 50 
}
```

Es momento de formular la manera en que podemos ver la relación del usuario con los proyectos, para ello vamos al servicio de consultar un usuario por su id y añadir un left join para traer los proyectos asociados al usuario, junto con otro left join para traer la información del proyecto referido:

```ts
@Injectable()
export class UsersService {
    ...
    public async findUserById ( id: string ): Promise<UserEntity> {
        try {
            const user: UserEntity = await this._userRepository
                .createQueryBuilder( 'user' )
                .where( { id } )
                .leftJoinAndSelect( 'user.projectsIncludes', 'projectsIncludes' )
                .leftJoinAndSelect( 'projectsIncludes.project', 'project' )
                .getOne()

            if ( !user ) { ... }
            return user
        } catch ( error ) { ... }
    }
    ...
}
```

También podemos hacer lo mismo para los proyectos:

```ts
@Injectable()
export class ProjectsService {
    ...
    public async findProjectById ( id: string ): Promise<ProjectEntity> {
        try {
            const project: ProjectEntity = await this._projectRepository
                .createQueryBuilder( 'project' )
                .where( { id } )
                .leftJoinAndSelect( 'project.usersIncludes', 'usersIncludes' )
                .leftJoinAndSelect( 'usersIncludes.user', 'user' )
                .getOne()
            if ( !project ) { ... }
            return project
        } catch ( error ) { ... }
    }
    ...
}
```

___

| Anterior               | Readme                 | Siguiente              |
| ---------------------- | ---------------------- | ---------------------- |
| [Error Handlers y Controladores](./P7T1_Error_Handlers_Controladores.md) | [Readme](../README.md) | [Autenticación de usuarios](./P9T1_Autenticacion_Usuarios.md) |
