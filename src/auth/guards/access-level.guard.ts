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


    /**
     * It checks if the user is an admin, if the user is not an admin, it checks if the user is part of
     * the project, if the user is part of the project, it checks if the user has the necessary access
     * level to perform the operation
     * @param {ExecutionContext} context - ExecutionContext - This is the context of the request.
     * @returns A boolean value that indicates if the user can access the route or not.
     */
    async canActivate ( context: ExecutionContext ): Promise<boolean> {
        const isPublic = this._reflector.get<boolean>( PUBLIC_KEY, context.getHandler() );

        if ( isPublic ) return true;

        const roles = this._reflector.get<Array<keyof typeof ROLES>>( ROLES_KEY, context.getHandler() );

        const admin = this._reflector.get<string>( ADMIN_KEY, context.getHandler() );

        const accessLevel = this._reflector.get<number>( ACCESS_LEVEL_KEY, context.getHandler() );

        const req = context.switchToHttp().getRequest<Request>();

        const { roleUser, idUser } = req;

        if ( roleUser === ROLES.ADMIN ) return true;

        if ( !accessLevel ) {
            if ( !roles ) {
                if ( !admin ) return true;
                else if ( admin && roleUser === admin ) return true;
                else throw new UnauthorizedException( "You do not have permissions for this operation" );
            }
        }

        const user = await this._userService.findUserById( idUser );

        if ( !user ) throw new UnauthorizedException( 'Invalid User' );

        const userExistInProject = user.projectsIncludes.find( ( project ) => project.project.id === req.params.projectId );

        if ( !userExistInProject ) throw new UnauthorizedException( 'You are not part of the project' );


        if ( accessLevel !== userExistInProject.accessLevel ) throw new UnauthorizedException( 'You do not have the necessary access level' );

        return true;
    }
}
