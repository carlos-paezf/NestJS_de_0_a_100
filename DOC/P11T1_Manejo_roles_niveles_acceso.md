# Manejo de roles y niveles de acceso

Vamos a añadir nuevas claves dentro del nuestro archivo `key-decorators`:

```ts
export const ROLES_KEY = 'ROLES';
export const ADMIN_KEY = 'ADMIN';
export const ACCESS_LEVEL_KEY = 'ACCESS_LEVEL';
```

Luego, creamos 3 decoradores nuevos con los siguientes comandos:

```txt
$: nest g d auth/decorators/roles --flat --no-spec
$: nest g d auth/decorators/admin-access --flat --no-spec
$: nest g d auth/decorators/access-level --flat --no-spec
```

El primero que vamos a editar es el decorador de roles, el cual debe recibir por parámetro un arreglo de tipos de rol:

```ts
import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../../constants/key-decorators';
import { ROLES } from 'src/constants';

export const Roles = ( ...roles: Array<keyof typeof ROLES> ) => SetMetadata( ROLES_KEY, roles );
```

En el decorador de admin, reflectamos en la metadata el rol Admin:

```ts
import { SetMetadata } from '@nestjs/common';
import { ADMIN_KEY } from 'src/constants/key-decorators';
import { ROLES } from '../../constants/roles';

export const AdminAccess = () => SetMetadata( ADMIN_KEY, ROLES.ADMIN );
```

En decorador de Access Level, reflejamos el nivel de acceso del usuario:

```ts
import { SetMetadata } from '@nestjs/common';
import { ACCESS_LEVEL_KEY } from '../../constants/key-decorators';

export const AccessLevel = ( level: number ) => SetMetadata( ACCESS_LEVEL_KEY, level );
```

Ahora crearemos 2 guards con los siguientes comandos:

```txt
$: nest g gu auth/guards/roles --flat --no-spec
$: nest g gu auth/guards/access-level --flat --no-spec
```

Dentro del guard de roles observamos que, la función canActivate verifica si el usuario tiene los permisos necesarios para acceder a la ruta que está solicitando. Si la ruta es pública, devuelve true. Si la ruta no es pública, verifica si el usuario tiene el rol requerido. Si el usuario tiene el rol requerido, devuelve true. Si el usuario no tiene el rol requerido, lanza un error de autorización:

```ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { ROLES } from 'src/constants';
import { ADMIN_KEY, PUBLIC_KEY, ROLES_KEY } from 'src/constants/key-decorators';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor ( private readonly _reflector: Reflector ) { }

    canActivate ( context: ExecutionContext ): boolean | Promise<boolean> | Observable<boolean> {
        const isPublic = this._reflector.get<boolean>( PUBLIC_KEY, context.getHandler() );

        if ( isPublic ) return true;

        const roles = this._reflector.get<Array<keyof typeof ROLES>>( ROLES_KEY, context.getHandler() );

        const admin = this._reflector.get<string>( ADMIN_KEY, context.getHandler() );

        const req = context.switchToHttp().getRequest<Request>();

        const { roleUser } = req;

        if ( roleUser === ROLES.ADMIN ) return true;

        if ( !roles ) {
            if ( !admin ) return true;
            else if ( admin && roleUser === admin ) return true;
            else throw new UnauthorizedException( "You do not have permissions for this operation" );
        }

        const isAuth = roles.some( ( role ) => role === roleUser );

        if ( !isAuth ) throw new UnauthorizedException( "You do not have permissions for this operation" );

        return true;
    }
}
```

Es momento de usar el decorador y guard de roles dentro del controlador de usuarios, además del decorador para administradores:

```ts
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AdminAccess } from 'src/auth/decorators/admin-access.decorator';
...
@Controller( 'users' )
@UseGuards( ..., RolesGuard )
export class UsersController {
    ...
    @Roles( 'ADMIN' )
    @Put( 'edit/:id' )
    public async updateUser ( @Param( 'id' ) id: string, @Body() body: UserUpdateDTO ) { ... }

    @AdminAccess()
    @Delete( 'delete/:id' )
    public async deleteUser ( @Param( 'id' ) id: string ) { ... }
    ...
}
```

Con estos dos decoradores, logramos que en todos los casos el administrador tenga acceso, pero que en algunos endpoints le brindemos el acceso a ciertos roles.

Seguimos con el guard de niveles de acceso, en donde debemos inyectar el servicio del usuario, para poder consultar el nivel de acceso a cada proyecto. Claramente hay mucha lógica repetida en los guards que hemos creado, y que podría ser almacenada dentro de un método común para aplicar el principio DRY, pero, en esta ocasión vamos mantener explicito el código para efectos educativos.

```ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES } from 'src/constants';
import { ACCESS_LEVEL_KEY, ADMIN_KEY, PUBLIC_KEY, ROLES_KEY } from 'src/constants/key-decorators';
import { UsersService } from 'src/users/services/users.service';

@Injectable()
export class AccessLevelGuard implements CanActivate {
    constructor (
        private readonly _reflector: Reflector, private readonly _userService: UsersService
    ) { }


    async canActivate ( context: ExecutionContext ): Promise<boolean> {
        const isPublic = this._reflector.get<boolean>( PUBLIC_KEY, context.getHandler() );

        if ( isPublic ) return true;

        const roles = this._reflector.get<Array<keyof typeof ROLES>>( ROLES_KEY, context.getHandler() );

        const admin = this._reflector.get<string>( ADMIN_KEY, context.getHandler() );

        const accessLevel = this._reflector.get<number>( ACCESS_LEVEL_KEY, context.getHandler() );

        const req = context.switchToHttp().getRequest<Request>();

        const { roleUser, idUser } = req;

        if ( roleUser === ROLES.ADMIN ) return true;

        const user = await this._userService.findUserById( idUser );

        if ( !user ) throw new UnauthorizedException( 'Invalid User' );

        const userExistInProject = user.projectsIncludes.find( ( project ) => project.project.id === req.params[ 'projectId' ] );

        if ( !userExistInProject ) throw new UnauthorizedException( 'You are not part of the project' );

        if ( accessLevel !== userExistInProject.accessLevel ) throw new UnauthorizedException( 'You do not have the necessary access level' );

        return true;
    }
}
```

Lo siguiente es hacer uso de los guards y el decorador de nivel de acceso dentro del controlador de proyectos:

```ts
import { ..., UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { AccessLevelGuard } from '../../auth/guards/access-level.guard';
import { AccessLevel } from 'src/auth/decorators/access-level.decorator';
...
@Controller( 'projects' )
@UseGuards( AuthGuard, RolesGuard, AccessLevelGuard )
export class ProjectsController {
    ...
    @AccessLevel( 50 )
    @Put( 'edit/:projectId' )
    public async updateProject ( @Param( 'projectId' ) projectId: string, @Body() body: ProjectUpdateDTO ) {
        return await this._projectService.updateProject( projectId, body );
    }
    ...
}
```

Es importante que dentro del módulo de proyectos importamos el módulo de usuarios, esto con el fin de poder usar el servicio que este último exporta:

```ts
@Module( {
    ...
    exports: [ UsersService ]
} )
export class UsersModule { }
```

```ts
import { UsersModule } from 'src/users/users.module';
...
@Module( {
    imports: [
        ...,
        UsersModule
    ],
    ...
} )
export class ProjectsModule { }
```

Otra manera es usar el decorador `@Global()` para declarar de manera global el módulo de usuarios y no tener que exportarlo constantemente en otros módulo:

```ts
import { Global, ... } from '@nestjs/common';
...
@Global()
@Module( { ... } )
export class UsersModule { }
```
