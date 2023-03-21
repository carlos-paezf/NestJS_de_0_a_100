# Documentación con Swagger y OpenAPI

## Fe de Erratas

Antes de empezar, vamos a corregir el decorador `AccessLevel` para recibir como parámetro un string y no un número cómo se estaba manejando. Dicho string debe ser una de las claves del enum `ACCESS_LEVEL`:

```ts
import { SetMetadata } from '@nestjs/common';
import { ACCESS_LEVEL } from '../../constants';
import { ACCESS_LEVEL_KEY } from '../../constants/key-decorators';

export const AccessLevel = ( level: keyof typeof ACCESS_LEVEL ) => SetMetadata( ACCESS_LEVEL_KEY, level );
```

Luego, vamos al guard `AccessLevelGuard` y cambiamos la el tipo de elemento que se obtiene de la metadata con el reflecto, y la manera en que validamos el nivel de acceso al proyecto:

```ts
@Injectable()
export class AccessLevelGuard implements CanActivate {
    ...
    async canActivate ( context: ExecutionContext ): Promise<boolean> {
        ...
        const accessLevel = this._reflector.get<string>( ACCESS_LEVEL_KEY, context.getHandler() );
        ...
        if ( ACCESS_LEVEL[ accessLevel ] > userExistInProject.accessLevel ) throw new UnauthorizedException( 'You do not have the necessary access level' );

        return true;
    }
}
```

Por último, corregimos los endpoints en los cuales se hace uso del decorador `AccessLevel`, cómo por ejemplo al momento de crear una tarea:

```ts
@Controller( 'tasks' )
@UseGuards( AuthGuard, RolesGuard, AccessLevelGuard )
export class TasksController {
    ...
    @AccessLevel( 'DEVELOPER' )
    @Post( 'create/:projectId' )
    create ( ... ) { ... }
    ...
}
```

## Swagger y OpenAPI

En esta ocasión vamos a usar la especificación de OpenApi, el cual es un formato de definición independiente del lenguaje usado para describir RESTful APIs. Nest provee un modulo dedicado el cual permite generar dicha especificación aprovechando los decoradores.

Vamos a realizar la instalación de una paquete con el siguiente comando:

```txt
$: pnpm install -S @nestjs/swagger
```

Luego, dentro del archivo `main.ts` configuramos algunos campos que se presentarán en la página generada por Swagger, y luego definimos el segmento de ruta por el que podemos acceder, en este caso es `docs` (es importante que esta configuración se realice luego de la configuración del prefijo global):

```ts
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
...
async function bootstrap () {
    ...
    app.setGlobalPrefix( 'api' );

    const documentConfig = new DocumentBuilder()
        .setTitle( 'Gestor de proyectos' )
        .setDescription( 'Gestión de proyectos y tareas asignadas' )
        .setVersion( '1.0' )
        .build();

    const document = SwaggerModule.createDocument( app, documentConfig );
    SwaggerModule.setup( 'docs', app, document );
    ...
}
```

Cuando el proyecto reconozca los cambios, podremos ir a `localhost:8000/docs/` y observar los endpoints que se reconocieron por defecto dentro del proyecto. Aunque tenemos las rutas configuradas, aún podemos personalizar muchas cosas, por ejemplo, vamos a separar los endpoints en secciones de acuerdo al módulo, para esto vamos a cada controlador y añadimos el decorador `@ApiTags`:

```ts
import { ApiTags } from '@nestjs/swagger';
...
@ApiTags( 'Users' )
@Controller( 'users' )
@UseGuards( AuthGuard, RolesGuard )
export class UsersController { ... }
```

Lo siguiente es añadir el decorador `@ApiProperty()` a cada propiedad de los DTOs, con el fin de que salgan en los esquemas de la documentación, por ejemplo:

```ts
import { IsNotEmpty, IsString } from 'class-validator';
import { IAuthBody } from "../interfaces/auth.interface";
import { ApiProperty } from '@nestjs/swagger';

export class AuthDTO implements IAuthBody {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    username: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    password: string;
}
```

En caso que queramos mostrar las opciones posibles para un enum, podemos añadir la siguiente definición:

```ts
export class UserDTO implements IUser {
    ...
    @ApiProperty( { enum: ROLES } )
    ...
    role: ROLES;
}
```

También podemos definir los parámetros de las endpoints:

```ts
export class TasksController {
    ...
    @Get( ':projectId/:taskId' )
    @ApiParam( {
        name: 'projectId',
        description: 'Id del proyecto contenedor',
        example: "e3685c60-079a-493e-b30d-48adf83515ae"
    } )
    @ApiParam( {
        name: 'taskId',
        description: "Id asignado a la tarea",
        example: "e47d6f5a-daba-4949-9d8c-1b119c2df019"
    } )
    findOne ( @Param( 'projectId' ) projectId: string, @Param( 'taskId' ) taskId: string ) { ... }
    ...
}
```

Otra configuración importante dentro de la documentación de los endpoints, son los headers, en este caso de autenticación:

```ts
@ApiHeader( {
    name: 'Authorization',
    description: 'Token generado en la autenticación'
} )
export class TasksController { ... }
```

En la documentación ofrecida por Nest en la sección de [OpenApi](https://docs.nestjs.com/openapi/introduction), podemos encontrar una gran variedad de configuraciones para aplicación de Swagger en nuestro proyecto

___

| Anterior               | Readme                 | Siguiente              |
| ---------------------- | ---------------------- | ---------------------- |
| [Terminando módulo de tareas](./P12T1_Terminando_modulo_tareas.md) | [Readme](../README.md) | [Módulo HTTP + Axios](./P14T1_Modulo_HHTP_Axios.md) |
