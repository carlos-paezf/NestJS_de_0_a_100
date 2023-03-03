import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { ROLES } from 'src/constants';
import { ADMIN_KEY, PUBLIC_KEY, ROLES_KEY } from 'src/constants/key-decorators';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor ( private readonly _reflector: Reflector ) { }


    /**
     * If the route is public, then return true. If the route is not public, then check if the user is
     * an admin. If the user is an admin, then return true. If the user is not an admin, then check if
     * the user has the required role. If the user has the required role, then return true. If the user
     * does not have the required role, then throw an error
     * @param {ExecutionContext} context - ExecutionContext - The context of the request.
     * @returns A boolean value.
     */
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
