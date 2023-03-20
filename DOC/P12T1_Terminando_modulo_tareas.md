# Terminando módulo de tareas

## Nuevo Rol

Vamos a crear la entidad de tareas, la cual se relaciona con la tabla de proyectos en una relación de `1:n`, es decir, `1` proyecto tiene `n` tareas, pero `1` tarea pertenece solo a `1` proyecto. Inicialmente vamos a crear un nuevo rol dentro del archivo `constants/roles.ts`:

```ts
export enum ROLES {
    BASIC = 'BASIC',
    CREATOR = 'CREATOR',
    ADMIN = 'ADMIN'
}
...
```

Luego, dentro del controlador de proyectos usamos el decorador de Roles para validar el acceso a las personas que tengan el role de Creador además del Admin:

```ts
import { Roles } from 'src/auth/decorators/roles.decorator';
...

@Controller( 'projects' )
@UseGuards( AuthGuard, RolesGuard, AccessLevelGuard )
export class ProjectsController {
    constructor ( private readonly _projectService: ProjectsService ) { }

    @Roles( 'CREATOR' )
    @Post( 'create' )
    public async createProject ( ... ): Promise<ProjectEntity> { ... }
    ...
}
```

Además añadimos un nuevo nivel de acceso para un desarrollador:

```ts
...
export enum ACCESS_LEVEL {
    DEVELOPER = 30,
    MAINTAINER = 40,
    OWNER = 50
}
```

Lo siguientes es aplicar las migraciones dentro de la base de datos para que reconozca los nuevos cambios:

```txt
$: pnpm m:gen -- src/migrations/UpdateAccessLevel
$: pnpm m:run
```

Para crear de manera correcta la relación en la base de datos, vamos a usar la entidad de `UserProjectsEntity` dentro de la configuración de TypeOrm en el módulo de proyectos:

```ts
@Module( {
    imports: [
        TypeOrmModule.forFeature( [
            ProjectEntity, UsersProjectsEntity
        ] )
    ],
    ...
} )
export class ProjectsModule { }
```

También inyectamos la entidad dentro del servicio de proyectos:

```ts
@Injectable()
export class ProjectsService {
    constructor (
        ...,
        @InjectRepository( UsersProjectsEntity ) private readonly _usersProjectsRepository: Repository<UsersProjectsEntity>
    ) { }
    ...
}
```

Al momento de crear el proyecto, es necesario guardar la relación que guarda con el dueño del mismo, por lo que dentro del DTO para la creación del proyecto añadimos una nueva propiedad:

```ts
export class ProjectDTO implements IProject {
    @IsNotEmpty()
    @IsUUID()
    userOwnerId: string;
    ...
}
```

Para poder guardar la información del usuario dentro del proyecto, debemos importar el módulo de usuarios dentro del módulo de proyectos:

```ts
@Module( {
    imports: [
        ...,
        UsersModule
    ],
    ...
} )
export class ProjectsModule { }
```

En el servicio de proyectos, inyectamos el servicio de usuarios y añadimos la siguiente lógica dentro del método de creación:

```ts
@Injectable()
export class ProjectsService {
    constructor (
        @InjectRepository( ProjectEntity ) private readonly _projectRepository: Repository<ProjectEntity>,
        @InjectRepository( UsersProjectsEntity ) private readonly _usersProjectsRepository: Repository<UsersProjectsEntity>,
        private readonly _usersService: UsersService
    ) { }
    ...
    public async createProject ( body: ProjectDTO ): Promise<ProjectEntity> {
        try {
            const { userOwnerId, ...projectData } = body;

            const user = await this._usersService.findUserById( userOwnerId );

            await this._usersProjectsRepository.save( {
                accessLevel: ACCESS_LEVEL.OWNER,
                project: projectData,
                user: user
            } );

            ...
        } catch ( error ) { ... }
    }
    ...
}
```

Antes de hacer la prueba del endpoint, vamos a corregir el guard `AccessLevelGuard` con el fin de que el usuario creador pueda proseguir:

```ts
@Injectable()
export class AccessLevelGuard implements CanActivate {
    constructor (
        private readonly _reflector: Reflector, private readonly _userService: UsersService
    ) { }
    ...
    async canActivate ( context: ExecutionContext ): Promise<boolean> {
        ...
        if ( roleUser === ROLES.ADMIN || roleUser === ROLES.CREATOR ) return true;
        ...
    }
}
```

Cuando probamos la nueva característica, tendremos un nuevo proyecto con un usuario con rol de Creador.

## Módulo de Tareas

Es momento de crear un nuevo módulo - recurso, destinado para las tareas de un proyecto, para lo cual usamos el siguiente comando:

```txt
$: nest g res tasks --no-spec
```

La entidad de este nuevo módulo debe contener la siguiente información:

```ts
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from '../../config/base.entity';
import { STATUS_TASK } from "../../constants";
import { ITask } from "../../interface/task.interface";
import { ProjectEntity } from "../../projects/entities/project.entity";

@Entity( { name: 'tasks' } )
export class TaskEntity extends BaseEntity {
    @Column()
    name: string;

    @Column()
    description: string;

    @Column( { type: 'enum', enum: STATUS_TASK, default: STATUS_TASK.NEW } )
    status: STATUS_TASK;

    @Column()
    responsableName: string;

    @ManyToOne( () => ProjectEntity, ( project ) => project.tasks )
    @JoinColumn( { name: 'project_id' } )
    project: ProjectEntity;
}
```

Para mantener la relación del lado de la entidad de proyectos, añadimos la siguiente propiedad:

```ts
@Entity( { name: 'projects' } )
export class ProjectEntity extends BaseEntity implements IProject {
    ...
    @OneToMany( () => TaskEntity, ( task ) => task.project )
    tasks: TaskEntity[];
}
```

Añadimos la nueva entidad a la configuración de TypeORM para el módulo de tareas:

```ts
@Module( {
    imports: [
        TypeOrmModule.forFeature( [ TaskEntity ] )
    ],
    ...
} )
export class TasksModule { }
```

Dentro del archivo de servicios, inyectamos el repositorio:

```ts
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TasksService {
    constructor ( @InjectRepository( TaskEntity ) private readonly _taskRepository: Repository<TaskEntity> ) { }
}
```

Luego necesitamos exportar el servicio de proyectos dentro de su módulo, e importarlo dentro del módulo de tareas:

```ts
@Module( {
    ...,
    exports: [ ProjectsService ]
} )
export class ProjectsModule { }
```

```ts
@Module( {
    imports: [
        TypeOrmModule.forFeature( [ ..., ProjectEntity ] ),
        ProjectsModule
    ],
    ...
} )
export class TasksModule { }
```

De vuelta a nuestro servicio, ajustamos el método de crear una tarea para que pueda buscar un proyecto por su id y guardarlo dentro de la nueva tarea:

```ts
@Injectable()
export class TasksService {
    constructor (
        @InjectRepository( TaskEntity ) private readonly _taskRepository: Repository<TaskEntity>,
        private readonly _projectsService: ProjectsService
    ) { }

    async create ( projectId: string, createTaskDto: CreateTaskDto ): Promise<TaskEntity> {
        try {
            const project = await this._projectsService.findProjectById( projectId );
            if ( !project ) {
                throw new ErrorManager( {
                    type: 'NOT_FOUND',
                    message: 'No se encontró el proyecto solicitado'
                } );
            }

            return await this._taskRepository.save( { ...createTaskDto, project } );

        } catch ( error ) {
            throw ErrorManager.createSignatureError( error.message );
        }
    }
    ...
}
```

El DTO del proyecto al momento de creación debe lucir de la siguiente manera:

```ts
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { STATUS_TASK } from "src/constants";
import { ITask } from "src/interface/task.interface";

export class CreateTaskDto implements ITask {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsOptional()
    @IsEnum( STATUS_TASK )
    status: STATUS_TASK;

    @IsNotEmpty()
    @IsString()
    responsableName: string;
}
```

Dentro del controlador de tareas creamos el endpoint para guardar una tarea:

```ts
@Controller( 'tasks' )
export class TasksController {
    constructor ( private readonly tasksService: TasksService ) { }

    @Post( 'create/:projectId' )
    create ( @Param( 'projectId' ) projectId: string, @Body() createTaskDto: CreateTaskDto ) {
        return this.tasksService.create( projectId, createTaskDto );
    }
}
```

Para poder realizar la petición, debemos crear la migración y aplicarla sobre la base de datos, para lo cual usamos los siguiente comandos:

```txt
$: pnpm m:gen -- src/migrations/tasks
$: pnpm m:run
```

También vamos a aplicar los guards para validar el rol necesario y el nivel de acceso al proyecto, por lo tanto dentro del controlador añadimos lo siguiente:

```ts
@Controller( 'tasks' )
@UseGuards( AuthGuard, RolesGuard, AccessLevelGuard )
export class TasksController {
    ...
    @AccessLevel( 30 )
    @Post( 'create/:projectId' )
    create ( @Param( 'projectId' ) projectId: string, @Body() createTaskDto: CreateTaskDto ) {
        return this.tasksService.create( projectId, createTaskDto );
    }
    ...
}
```

___

| Anterior               | Readme                 | Siguiente              |
| ---------------------- | ---------------------- | ---------------------- |
| [Manejo de roles y niveles de acceso](./P11T1_Manejo_roles_niveles_acceso.md) | [Readme](../README.md) | [Documentación con Swagger y OpenAPI](./P13T1_Documentacion_Swagger_OpenAPI.md) |
